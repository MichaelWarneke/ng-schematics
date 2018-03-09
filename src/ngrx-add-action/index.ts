import { Rule, SchematicsException, chain, Tree, SchematicContext, branchAndMerge } from '@angular-devkit/schematics';
import { normalize } from '@angular-devkit/core';
import { Schema } from './schema';

import { getSourceNodes, InsertChange, Change, NoopChange } from '../utils/otherUtils';

import * as ts from 'typescript';
import { stringUtils, capitalizeAll } from '../utils/stringUtils';

export default function(options: Schema): Rule {

  options.path = options.path ? normalize(options.path) : options.path;
  const sourceDir = options.sourceDir;
  if (!sourceDir) {
    throw new SchematicsException(`sourceDir option is required.`);
  } 

  if(options.payload && !options.payloadType) {
    throw new SchematicsException(`payloadType is required if payload is set.`);
  }

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
    let actionFilePath = options.path;

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

    let nodes = getSourceNodes(sourceFile);

    const actionTypesChange: Change = addActionToActionTypes(
      nodes,
      actionFilePath, 
      options.name,
      groupName
    );
    const actionInterfaceChange: Change = addActionInterface(
      nodes,
      actionFilePath, 
      options.name, 
      groupName,
      options.payload,
      options.payloadType
    );
    const actionTypeChange: Change = addActionType(
      nodes,
      actionFilePath, 
      options.name,
      groupName
    );
    const actionCreatorChange: Change = addActionCreator(
      nodes,
      actionFilePath, 
      options.name, 
      groupName,
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

export function addActionToActionTypes(
  nodes: ts.Node[],
  actionFilePath: string,
  name: string,
  groupName: string
): Change {
  let ctorNode = nodes.find(n => n.kind == ts.SyntaxKind.EnumMember);

  let node = ctorNode as ts.Statement;

  if (!node) {
    return new NoopChange();
  }
  

  const declaration = capitalizeAll(stringUtils.underscore(name)) + '_ACTION';
  const value = '\'[' + stringUtils.classify(groupName) + '] ' + stringUtils.classify(name) + '\''
  const newEnum = ',\n\t' + declaration + ' = ' + value;

  let position;
  let toInsert : string = newEnum;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}

export function addActionInterface(
  nodes: ts.Node[],
  actionFilePath: string,
  name: string,
  groupName: string,
  payload?: string,
  payloadType?: string
): Change {

  let ctorNode = nodes.find(n => n.kind == ts.SyntaxKind.InterfaceDeclaration);

  let node = ctorNode as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  const declaration = `\n\nexport interface ${stringUtils.classify(name)}Action extends Action {\n`;
  const type = `\ttype: ${stringUtils.classify(groupName)}ActionTypes.${capitalizeAll(stringUtils.underscore(name))}_ACTION;\n`;
  let payloadText = '';
  if(payload) {
    payloadText = `\t${payload}: ${payloadType};\n`;
  }
  const suffix = '}';

  let position;
  let toInsert : string = declaration + type + payloadText + suffix;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}

export function addActionType(
  nodes: ts.Node[],
  actionFilePath: string,
  name: string,
  groupName: string,
): Change {

  let ctorNode = nodes.find(n => n.kind == ts.SyntaxKind.TypeAliasDeclaration);

  let node = ctorNode as ts.Statement;

  if (!node) {
    return new NoopChange();
  }
  groupName;

  const type = `\n\t| ${stringUtils.classify(name)}Action`;

  let position;
  let toInsert : string = type;
  position = node.getEnd() - 1;

  return new InsertChange(actionFilePath, position, toInsert);
}

export function addActionCreator(
  nodes: ts.Node[],
  actionFilePath: string,
  name: string,
  groupName: string,
  payload?: string,
): Change {

  let ctorNode = nodes.find(n => n.kind == ts.SyntaxKind.FunctionDeclaration);

  let node = ctorNode as ts.Statement;

  if (!node) {
    return new NoopChange();
  }

  let plDecl, plSet = '';
  if(payload) {
    plDecl = `${payload}: ${stringUtils.classify(name)}Action['${payload}']`;
    plSet = `, ${payload}`
  }
  
  const declaration = `\n\nexport function create${stringUtils.classify(name)}Action(${plDecl}): ${stringUtils.classify(name)}Action {\n`;
  const ret = `\treturn { type: ${stringUtils.classify(groupName)}ActionTypes.${capitalizeAll(stringUtils.underscore(name))}_ACTION${plSet} };\n`;
  const suffix = '}';

  let position;
  let toInsert : string = declaration + ret + suffix;
  position = node.getEnd();

  return new InsertChange(actionFilePath, position, toInsert);
}

