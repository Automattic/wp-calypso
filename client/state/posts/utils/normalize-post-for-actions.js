/**
 * Internal dependencies
 */
import { decodeEntities } from 'calypso/lib/formatting';

function getParentId( post ) {
	if ( ! post || ! post.parent ) {
		return null;
	}

	if ( post.parent.ID ) {
		return post.parent.ID;
	}

	return post.parent;
}

function getPageTemplate( post ) {
	if ( ! post || ! post.page_template || post.page_template === 'default' ) {
		return '';
	}
	return post.page_template;
}

export function normalizePostForActions( post ) {
	post.parent_id = getParentId( post );
	if ( post.type === 'page' ) {
		post.page_template = getPageTemplate( post );
	}
	if ( post.title ) {
		post.title = decodeEntities( post.title );
	}

	return post;
}
