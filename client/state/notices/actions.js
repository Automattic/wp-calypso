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

export function createNotice( status, text, { id, ...noticeOptions } = {} ) {
	return {
		type: NOTICE_CREATE,
		notice: Object.assign( { showDismiss: true }, noticeOptions, {
			noticeId: id || uniqueId(),
			status,
			text,
		} ),
	};
}

export const successNotice = createNotice.bind( null, 'is-success' );
export const errorNotice = createNotice.bind( null, 'is-error' );
export const infoNotice = createNotice.bind( null, 'is-info' );
export const warningNotice = createNotice.bind( null, 'is-warning' );
export const plainNotice = createNotice.bind( null, 'is-plain' );

// Higher-order action creator: modify the wrapped creator to return actions with the
// `notices.skip` meta, so that it's ignored by the notices middleware.
export const withoutNotice = ( actionCreator ) => ( ...args ) =>
	extendAction( actionCreator( ...args ), { meta: { notices: { skip: true } } } );
