# NG-Schematics

This is a project for testing different angular schematic scenarios

It merges the ngrx and nrwl schematics and adds custom schematics.

At the moment the custom schematics consist of

# ngrx-action

Creates an action file with actions declared as interfaces and the usage of action creator functions.
This is the way the ngrx codegen produced actions.

ng g ngrx-action LoadBooks --groupName=Books

# ngrx-add-action

Adds an action to the specified action file by craetung the type, interface and creator function.

ng g ngrx-add-action SaveBooks --actionPath=<path to action file> --payload=book --payloadType=Book