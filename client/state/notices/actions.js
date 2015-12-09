/**
 * Internal dependencies
 */
import {
	NEW_NOTICE
} from './action-types';

export function newNotice( status, text, options ) {
    return {
        type: NEW_NOTICE,
        status: status,
        text: text
    };
}
