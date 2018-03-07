import { Rule, SchematicsException, apply, url, noop, filter, template, move, chain, mergeWith, branchAndMerge } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { dasherize, classify } from '@angular-devkit/core/src/utils/strings';

const stringUtils = { dasherize, classify };

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export default function(options: any): Rule {
  options.path = options.path ? normalize(options.path) : options.path;
  const sourceDir = options.sourceDir;
  if (!sourceDir) {
    throw new SchematicsException(`sourceDir option is required.`);
  }
  
  const templateSource = apply(url('./files'), [
    options.spec ? noop() : filter(path => !path.endsWith('__spec.ts')),
    template({
        ...(options as object),
        ...stringUtils,
      dot: () => '.',
    }),
    move(sourceDir),
  ]);

  return chain([branchAndMerge(chain([mergeWith(templateSource)]))]);
}
