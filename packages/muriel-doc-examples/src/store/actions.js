/**
 * External dependencies
 */
import { castArray } from 'lodash';

export function addExamples( examples ) {
    return {
        type: 'ADD_EXAMPLES',
        examples: castArray( examples )
    };
};
