import { Rule, SchematicsException, apply, url, noop, filter, template, move, chain, mergeWith, branchAndMerge } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { dasherize, classify, underscore } from '@angular-devkit/core/src/utils/strings';
import { Schema } from './schema';

/*
@method capitalize
@param {String} str The string to capitalize.
@return {String} The capitalized string.
*/
export function capitalizeAll(str: string): string {
 return str.toUpperCase();
}

export function group(name: string, group: string | undefined): string {
  return group ? `${group}/${name}` : name;
}

const stringUtils = { dasherize, classify, underscore, capitalizeAll };

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export default function(options: Schema): Rule {
  options.path = options.path ? normalize(options.path) : options.path;
  const sourceDir = options.sourceDir;
  if (!sourceDir) {
    throw new SchematicsException(`sourceDir option is required.`);
  }
  console.log("GroupName !!!!!!! ", options.groupName);
  console.log("Payload !!!!!!! ", options.payload);
  console.log("Payload Type !!!!!!! ", options.payloadType);
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
    move(sourceDir),
  ]);

  return chain([branchAndMerge(chain([mergeWith(templateSource)]))]);
}
