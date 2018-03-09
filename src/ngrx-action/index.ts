import { Rule, SchematicsException, apply, url, noop, filter, template, move, chain, mergeWith, branchAndMerge } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { Schema } from './schema';

import { stringUtils, group } from '../utils/stringUtils';

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export default function(options: Schema): Rule {

  options.type = !!options.type ? `.${options.type}` : '';
  options.path = options.path ? normalize(options.path) : options.path;
  options.groupName = options.groupName ? options.groupName : options.name;
  const sourceDir = options.sourceDir;

  if (!sourceDir) {
    throw new SchematicsException(`sourceDir option is required.`);
  } 

  if(options.payload && !options.payloadType) {
    throw new SchematicsException(`payloadType is required if payload is set.`);
  }

  return chain([
    branchAndMerge(chain([
      mergeWith(createTemplate(options))
    ]))
  ]);
}

function createTemplate(options: Schema) {
  const templateSource = apply(url('./files'), [
    options.spec ? noop() : filter(path => !path.endsWith('__spec.ts')),
    template({
      'if-flat': (s: string) =>
        group(
          options.flat ? '' : s,
          options.group ? 'actions' : ''
        ),
      ...stringUtils,
      ...(options as object),
      dot: () => '.',
    }),
    move(options.sourceDir),
  ]);
  return templateSource;
}
