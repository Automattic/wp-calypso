/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE,
	SET_ROUTE
} from 'state/action-types';

import { uniqueId } from 'lodash';

export function removeNotice( noticeId ) {
	return {
		noticeId: noticeId,
		type: REMOVE_NOTICE
	};
}

function createNotice( status, text, options = {} ) {
	const notice = {
		noticeId: options.id || uniqueId(),
		duration: options.duration,
		showDismiss: ( typeof options.showDismiss === 'boolean' ? options.showDismiss : true ),
		isPersistent: options.isPersistent || false,
		displayOnNextPage: options.displayOnNextPage || false,
		status: status,
		text: text
	};

	return {
		type: NEW_NOTICE,
		notice: notice
	};
}

export function setRoute( path ) {
	return {
		type: SET_ROUTE,
		path: path
	};
}

export const successNotice = createNotice.bind( null, 'is-success' );
export const errorNotice = createNotice.bind( null, 'is-error' );
export const infoNotice = createNotice.bind( null, 'is-info' );
