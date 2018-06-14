/** @format */

/**
 * Internal dependencies
 */

import {
	DOCUMENT_HEAD_LINK_SET,
	DOCUMENT_HEAD_META_SET,
	DOCUMENT_HEAD_TITLE_SET,
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
		title,
	};
}

/**
 * Returns an action object used in signalling that the specified link object
 * should be included in the set of document head links.
 *
 * @param  {Object} link Link object
 * @return {Object}      Action object
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
 * @param  {Object} meta Meta object
 * @return {Object}      Action object
 */
export function setDocumentHeadMeta( meta ) {
	return {
		type: DOCUMENT_HEAD_META_SET,
		meta,
	};
}
