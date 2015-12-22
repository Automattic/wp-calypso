/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE
} from 'state/action-types';

import { uniqueId } from 'lodash';

export function removeNotice( noticeId ) {
	return {
		noticeId: noticeId,
		type: REMOVE_NOTICE
	};
}

function createNotice( status, text, options = {} ) {
	return ( dispatch ) => {
		const notice = {
			noticeId: uniqueId(),
			duration: options.duration,
			showDismiss: ( typeof options.showDismiss === 'boolean' ? options.showDismiss : true ),
			status: status,
			text: text
		};

		if ( notice.duration > 0 ) {
			setTimeout( () => {
				dispatch( removeNotice( notice.noticeId ) );
			}, notice.duration );
		}

		dispatch( {
			type: NEW_NOTICE,
			notice: notice
		} );
	}
}

export const successNotice = createNotice.bind( null, 'is-success' );
export const errorNotice = createNotice.bind( null, 'is-error' );

