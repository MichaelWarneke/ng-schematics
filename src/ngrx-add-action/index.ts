import { Rule, SchematicsException, chain, Tree, SchematicContext, branchAndMerge } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { Schema } from './schema';

import { InsertChange, Change, NoopChange } from '../utils/otherUtils';

import * as ts from 'typescript';
import { stringUtils, capitalizeAll } from '../utils/stringUtils';

export default function(options: Schema): Rule {

  if(options.payload && !options.payloadType) {
    throw new SchematicsException(`payloadType is required if payload is set.`);
  }

  if(!options.actionPath) {
    throw new SchematicsException(`Please specify actionPath variable to the action file.`); 
  }

  options.actionPath = options.actionPath.length > 1 ? normalize(options.actionPath) : options.actionPath;

  return chain([
    (_host: Tree, context: SchematicContext) => {
      // Show the options for this Schematics.
      context.logger.info('My Full Schematic: ' + JSON.stringify(options));

    },
    branchAndMerge(
      chain([
        addActionToActionFile(options),
      ])
    ),
  ]);
}

export function addActionToActionFile(options: Schema): Rule {
  return (host: Tree) => {
    let actionFilePath = options.actionPath;

    if(!actionFilePath) {
      throw new SchematicsException(`Please specify path variable to the action file.`); 
    }

    let text = host.read(actionFilePath);

    if (!text){
      throw new SchematicsException(`File ${options.actionPath} does not exist.`);
    }
  
    let sourceText = text.toString('utf-8');
  
    let sourceFile = ts.createSourceFile(
      actionFilePath,
      sourceText,
      ts.ScriptTarget.Latest,
      true
    );

    const groupName = actionFilePath.substring(
      actionFilePath.lastIndexOf("/") + 1,
      actionFilePath.indexOf('.actions.ts')
    )

    const actionTypesChange: Change = addActionConst(
      sourceFile,
      actionFilePath, 
      options.name,
      groupName
    );
    const actionInterfaceChange: Change = addActionInterface(
      sourceFile,
      actionFilePath, 
      options.name, 
      options.payload,
      options.payloadType
    );
    const actionTypeChange: Change = addActionType(
      sourceFile,
      actionFilePath, 
      options.name,
      groupName
    );
    const actionCreatorChange: Change = addActionCreator(
      sourceFile,
      actionFilePath, 
      options.name, 
      options.payload
    );

    const changes: Change[] = [actionTypesChange, actionInterfaceChange, actionTypeChange, actionCreatorChange];
    const recorder = host.beginUpdate(actionFilePath);

    for (const change of changes) {
      if (change instanceof InsertChange) {
        recorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(recorder);

    return host;
  }
}

export function addActionConst(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  groupName: string
): Change {
  const ctorNode = source.statements.filter(
    stm => stm.kind === ts.SyntaxKind.VariableStatement
  );
  let node = ctorNode.pop() as ts.Statement;

  if (!node) {
    console.log("No const added");
    return new NoopChange();
  }

  const declaration = capitalizeAll(stringUtils.underscore(name)) + '_ACTION';
  const value = '\'[' + stringUtils.classify(groupName) + '] ' + stringUtils.classify(name) + '\';'
  const newEnum = '\nexport const ' + declaration + ' = ' + value;

  let position;
  let toInsert : string = newEnum;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}


// Old uses enum
export function addActionToActionTypes(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  groupName: string
): Change {
  const ctorNode = source.statements.find(
    stm => stm.kind === ts.SyntaxKind.EnumDeclaration
  );
  let node = ctorNode as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  const declaration = capitalizeAll(stringUtils.underscore(name)) + '_ACTION';
  const value = '\'[' + stringUtils.classify(groupName) + '] ' + stringUtils.classify(name) + '\''
  const newEnum = ',\n  ' + declaration + ' = ' + value;

  let position;
  let toInsert : string = newEnum;
  position = node.getEnd()-2;

  return new InsertChange(actionFilePath, position, toInsert);
}

export function addActionInterface(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  payload?: string,
  payloadType?: string
): Change {

  const ctorNode = source.statements.filter(
    stm => stm.kind === ts.SyntaxKind.InterfaceDeclaration
  );
  let node = ctorNode.pop() as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  const declaration = `\n\nexport interface ${stringUtils.classify(name)}Action extends Action {\n`;
  const type = `  type: typeof ${capitalizeAll(stringUtils.underscore(name))}_ACTION;\n`;
  let payloadText = '';
  if(payload) {
    payloadText = `  ${payload}: ${payloadType};\n`;
  }
  const suffix = '}';

  let position;
  let toInsert : string = declaration + type + payloadText + suffix;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}

// Old uses enum
export function addActionInterfaceEnum(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  groupName: string,
  payload?: string,
  payloadType?: string
): Change {

  const ctorNode = source.statements.filter(
    stm => stm.kind === ts.SyntaxKind.InterfaceDeclaration
  );
  let node = ctorNode.pop() as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  const declaration = `\n\nexport interface ${stringUtils.classify(name)}Action extends Action {\n`;
  const type = `  type: ${stringUtils.classify(groupName)}ActionTypes.${capitalizeAll(stringUtils.underscore(name))}_ACTION;\n`;
  let payloadText = '';
  if(payload) {
    payloadText = `  ${payload}: ${payloadType};\n`;
  }
  const suffix = '}';

  let position;
  let toInsert : string = declaration + type + payloadText + suffix;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}

export function addActionType(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  groupName: string,
): Change {

  const ctorNode = source.statements.find(
    stm => stm.kind === ts.SyntaxKind.TypeAliasDeclaration
  );
  let node = ctorNode as ts.Statement;

  if (!node) {
    return new NoopChange();
  }
  groupName;

  const type = `\n  | ${stringUtils.classify(name)}Action`;

  let position;
  let toInsert : string = type;
  position = node.getEnd() - 1;

  return new InsertChange(actionFilePath, position, toInsert);
}

export function addActionCreator(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  payload?: string,
): Change {

  const ctorNode = source.statements.filter(
    stm => stm.kind === ts.SyntaxKind.FunctionDeclaration
  );
  let node = ctorNode.pop() as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  let plDecl = '';
  let plSet = '';
  if(payload) {
    plDecl = `${payload}: ${stringUtils.classify(name)}Action['${payload}']`;
    plSet = `, ${payload}`
  }
  
  const declaration = `\n\nexport function create${stringUtils.classify(name)}Action(${plDecl}): ${stringUtils.classify(name)}Action {\n`;
  const ret = `  return { type: ${capitalizeAll(stringUtils.underscore(name))}_ACTION${plSet} };\n`;
  const suffix = '}';

  let position;
  let toInsert : string = declaration + ret + suffix;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}

// Old uses enum
export function addActionCreatorEnum(
  source: ts.SourceFile,
  actionFilePath: string,
  name: string,
  groupName: string,
  payload?: string,
): Change {

  const ctorNode = source.statements.filter(
    stm => stm.kind === ts.SyntaxKind.FunctionDeclaration
  );
  let node = ctorNode.pop() as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  let plDecl = '';
  let plSet = '';
  if(payload) {
    plDecl = `${payload}: ${stringUtils.classify(name)}Action['${payload}']`;
    plSet = `, ${payload}`
  }
  
  const declaration = `\n\nexport function create${stringUtils.classify(name)}Action(${plDecl}): ${stringUtils.classify(name)}Action {\n`;
  const ret = `  return { type: ${stringUtils.classify(groupName)}ActionTypes.${capitalizeAll(stringUtils.underscore(name))}_ACTION${plSet} };\n`;
  const suffix = '}';

  let position;
  let toInsert : string = declaration + ret + suffix;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}
