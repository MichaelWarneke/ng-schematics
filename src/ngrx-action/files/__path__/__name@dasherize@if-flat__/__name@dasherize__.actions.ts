import { Action } from '@ngrx/store';

export enum <%= classify(groupName) %>ActionType {
  <%= capitalizeAll(underscore(name)) %>_ACTION = '[<%= classify(groupName) %>] <%= classify(name) %>'
}

export interface <%= classify(name) %>Action extends Action {
  type: <%= classify(groupName) %>ActionType.<%= capitalizeAll(underscore(name)) %>_ACTION;
  <% if (payload) { %><%= payload %>: <%= payloadType %><% } %>
}

export type <%= classify(groupName) %>Actions = <%= classify(name) %>Action;

export function create<%= classify(name) %>Action(<%= payload %>: <%= classify(name) %>Action['<%= payload %>']): <%= classify(name) %>Action {
  return { type: <%= classify(groupName) %>ActionType.<%= capitalizeAll(underscore(name)) %>_ACTION, <%= payload %> };
}