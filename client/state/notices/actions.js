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

export function noticesMapDispatchToProps( dispatch ) {
	function createNotice( type, text, options ) {
		var action = createNoticeAction( type, text, options );

		if ( action.duration > 0 ) {
			setTimeout( () => {
				dispatch( removeNoticeAction( action.noticeId ) );
			}, action.duration );
		}

		dispatch( action );
	}

	return {
		successNotice: createNotice.bind( null, 'is-success' ),
		errorNotice: createNotice.bind( null, 'is-error' ),
		removeNotice: ( noticeId ) => {
			dispatch( removeNoticeAction( noticeId ) );
		}
	};
}
