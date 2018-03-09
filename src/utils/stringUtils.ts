import { dasherize, classify, underscore } from '@angular-devkit/core/src/utils/strings';


export function capitalizeAll(str: string): string {
    return str.toUpperCase();
}

export function group(name: string, group: string | undefined): string {
    return group ? `${group}/${name}` : name;
}

export const stringUtils = { dasherize, classify, underscore, capitalizeAll };