/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
    REMOVE_NOTICE
} from './action-types';

import { uniqueId } from 'lodash';

function newNotice( status, text, options ) {
    return {
        noticeId: uniqueId(),
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

export function removeNotice( noticeId ) {
    return {
        noticeId: noticeId,
        type: REMOVE_NOTICE
    };
}
