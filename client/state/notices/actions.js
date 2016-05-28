/**
 * External dependencies
 */
import uniqueId from 'lodash/uniqueId';

/**
 * Internal dependencies
 */
import {
	NEW_NOTICE,
	REMOVE_NOTICE,
	SET_ROUTE,
	CLICK_NOTICE,
} from 'state/action-types';

export function removeNotice( noticeId ) {
	return {
		noticeId,
		type: REMOVE_NOTICE
	};
}

export function clickNotice( noticeId ) {
	return {
		noticeId,
		type: CLICK_NOTICE
	};
}

export function createNotice( status, text, options = {} ) {
	const noticeId = options.id || uniqueId();
	const notice = {
		noticeId,
		icon: options.icon || null,
		duration: parseInt( options.duration, 10 ) || null,
		button: options.button,
		showDismiss: ( typeof options.showDismiss === 'boolean' ? options.showDismiss : true ),
		isPersistent: options.isPersistent || false,
		displayOnNextPage: options.displayOnNextPage || false,
		status: status,
		text: text,
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
export const warningNotice = createNotice.bind( null, 'is-warning' );
export const updateNotice = createNotice.bind( null, 'is-update' );
