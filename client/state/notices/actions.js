/** @format */

/**
 * External dependencies
 */

import impureLodash from 'lib/impure-lodash';
const { uniqueId } = impureLodash;

/**
 * Internal dependencies
 */
import { NOTICE_CREATE, NOTICE_REMOVE } from 'state/action-types';
import { extendAction } from 'state/utils';

export function removeNotice( noticeId ) {
	return {
		noticeId: noticeId,
		type: NOTICE_REMOVE,
	};
}

export function createNotice( status, text, options = {} ) {
	const showDismiss = typeof options.showDismiss === 'boolean' ? options.showDismiss : true;
	const notice = {
		button: options.button,
		displayOnNextPage: options.displayOnNextPage || false,
		duration: options.duration,
		href: options.href,
		icon: options.icon,
		isPersistent: options.isPersistent || false,
		noticeId: options.id || uniqueId(),
		onClick: options.onClick,
		showDismiss,
		status: status,
		text: text,
	};
	if ( showDismiss && typeof options.onDismissClick === 'function' ) {
		notice.onDismissClick = options.onDismissClick;
	}

	return {
		type: NOTICE_CREATE,
		notice: notice,
	};
}

export const successNotice = createNotice.bind( null, 'is-success' );
export const errorNotice = createNotice.bind( null, 'is-error' );
export const infoNotice = createNotice.bind( null, 'is-info' );
export const warningNotice = createNotice.bind( null, 'is-warning' );
export const plainNotice = createNotice.bind( null, 'is-plain' );

// Higher-order action creator: modify the wrapped creator to return actions with the
// `notices.skip` meta, so that it's ignored by the notices middleware.
export const withoutNotice = actionCreator => ( ...args ) =>
	extendAction( actionCreator( ...args ), { meta: { notices: { skip: true } } } );
