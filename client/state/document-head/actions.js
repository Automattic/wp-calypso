/**
 * Internal dependencies
 */

import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET,
} from 'calypso/state/action-types';

/**
 * Returns an action object used in signalling that the document head title
 * should be assigned to the specified value.
 *
 * @param  {string} title Document title
 * @returns {object}       Action object
 */
export function setDocumentHeadTitle( title ) {
	return {
		type: DOCUMENT_HEAD_TITLE_SET,
		title,
	};
}

/**
 * Returns an action object used in signalling that the unread count to be
 * shown in the document title should be assigned to the specified value.
 *
 * @param  {number} count Unread count
 * @returns {object}       Action object
 */
export function setDocumentHeadUnreadCount( count ) {
	return {
		type: DOCUMENT_HEAD_UNREAD_COUNT_SET,
		count,
	};
}

/**
 * Returns an action object used in signalling that the specified link object
 * should be included in the set of document head links.
 *
 * @param  {object|Array<object>} link Link object (or array of link objects)
 * @returns {object}      Action object
 */
export function setDocumentHeadLink( link ) {
	return {
		type: DOCUMENT_HEAD_LINK_SET,
		link,
	};
}

/**
 * Returns an action object used in signalling that the specified meta object
 * should be included in the set of document head metas.
 *
 * @param  {object} meta Meta object
 * @returns {object}      Action object
 */
export function setDocumentHeadMeta( meta ) {
	return {
		type: DOCUMENT_HEAD_META_SET,
		meta,
	};
}
