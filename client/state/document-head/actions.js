/**
 * Internal dependencies
 */
import {
	DOCUMENT_HEAD_LINK_ADD,
	DOCUMENT_HEAD_META_ADD,
	DOCUMENT_HEAD_TITLE_SET,
	DOCUMENT_HEAD_UNREAD_COUNT_SET
} from 'state/action-types';

/**
 * Returns an action object used in signalling that the document head title
 * should be assigned to the specified value.
 *
 * @param  {String} title Document title
 * @return {Object}       Action object
 */
export function setDocumentHeadTitle( title ) {
	return {
		type: DOCUMENT_HEAD_TITLE_SET,
		title
	};
}

/**
 * Returns an action object used in signalling that the unread count to be
 * shown in the document title should be assigned to the specified value.
 *
 * @param  {Number} count Unread count
 * @return {Object}       Action object
 */
export function setDocumentHeadUnreadCount( count ) {
	return {
		type: DOCUMENT_HEAD_UNREAD_COUNT_SET,
		count
	};
}

/**
 * Returns an action object used in signalling that the document head
 * description meta should be assigned to the specified value.
 *
 * @param  {String} description Document description
 * @return {Object}             Action object
 */
export function setDocumentHeadDescription( description ) {
	return addDocumentHeadMeta( {
		name: 'description',
		content: description
	} );
}

/**
 * Returns an action object used in signalling that the specified link object
 * should be included in the set of document head links.
 *
 * @param  {Object} link Link object
 * @return {Object}      Action object
 */
export function addDocumentHeadLink( link ) {
	return {
		type: DOCUMENT_HEAD_LINK_ADD,
		link
	};
}

/**
 * Returns an action object used in signalling that the specified meta object
 * should be included in the set of document head metas.
 *
 * @param  {Object} meta Meta object
 * @return {Object}      Action object
 */
export function addDocumentHeadMeta( meta ) {
	return {
		type: DOCUMENT_HEAD_META_ADD,
		meta
	};
}
