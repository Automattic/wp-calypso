/**
 * External dependencies
 */
import uniqueId from 'lodash/uniqueId';

/**
 * Internal dependencies
 */
import {
	NOTICE_CREATE,
	NOTICE_REMOVE,
	ROUTE_SET
} from 'state/action-types';

export function removeNotice( noticeId ) {
	return {
		noticeId: noticeId,
		type: NOTICE_REMOVE
	};
}

export function createNotice( status, text, options = {} ) {
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
		type: NOTICE_CREATE,
		notice: notice
	};
}

export function setRoute( path ) {
	return {
		type: ROUTE_SET,
		path: path
	};
}

export const successNotice = createNotice.bind( null, 'is-success' );
export const errorNotice = createNotice.bind( null, 'is-error' );
export const infoNotice = createNotice.bind( null, 'is-info' );
export const warningNotice = createNotice.bind( null, 'is-warning' );
