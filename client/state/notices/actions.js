/**
 * Internal dependencies
 */
import {
	NEW_NOTICE
} from './action-types';

function newNotice( status, text, options ) {
    return {
        type: NEW_NOTICE,
        status: status,
        text: text
    };
}

export function success( text, options ) {
    return newNotice( 'is-success', text, options );
}

export function error( text, options ) {
    return newNotice( 'is-error', text, options );
}
