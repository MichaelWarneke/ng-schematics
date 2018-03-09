import { Action } from '@ngrx/store';

export enum SampleActionType {
  LOAD_BOOKS_ACTION = '[Sample] LoadBooks'
}

export interface LoadBooksAction extends Action {
  type: SampleActionType.LOAD_BOOKS_ACTION;
  myId: string;
}

export type SampleActions = LoadBooksAction;

export function createLoadBooksAction(myId: LoadBooksAction['myId']): LoadBooksAction {
  return { type: SampleActionType.LOAD_BOOKS_ACTION, myId };
}