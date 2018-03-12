import { Action } from '@ngrx/store';

export const <%= capitalizeAll(underscore(name)) %>_ACTION = '[<%= classify(groupName) %>] <%= classify(name) %>';

export interface <%= classify(name) %>Action extends Action {
  type: typeof <%= capitalizeAll(underscore(name)) %>_ACTION;<% if (payload) { %>
  <%= payload %>: <%= payloadType %>;<% } %>
}

export type <%= classify(groupName) %>Actions
  = <%= classify(name) %>Action;

export function create<%= classify(name) %>Action(<% if (payload) { %><%= payload %>: <%= classify(name) %>Action['<%= payload %>']<% } %>): <%= classify(name) %>Action {
  return { type: <%= capitalizeAll(underscore(name)) %>_ACTION<% if (payload) { %>, <%= payload %><% } %> };
}
