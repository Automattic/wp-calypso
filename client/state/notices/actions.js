/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
    REMOVE_NOTICE
} from './action-types';

import { uniqueId } from 'lodash';

export function createNoticeAction( status, text, options = {} ) {
	return {
		noticeId: uniqueId(),
		duration: options.duration,
		showDismiss: ( typeof options.showDismiss === 'boolean' ? options.showDismiss : true ),
		type: NEW_NOTICE,
		status: status,
		text: text
	};
}

export function removeNoticeAction( noticeId ) {
	return {
		noticeId: noticeId,
		type: REMOVE_NOTICE
	};
}
