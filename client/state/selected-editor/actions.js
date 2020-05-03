/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_REQUEST, EDITOR_TYPE_UPDATE } from 'state/action-types';
import 'state/data-layer/wpcom/sites/gutenberg';

export const requestSelectedEditor = ( siteId ) => ( {
	type: EDITOR_TYPE_REQUEST,
	siteId,
} );

export const setSelectedEditor = ( siteId, editor, redirectUrl ) => ( {
	type: EDITOR_TYPE_UPDATE,
	siteId,
	editor,
	redirectUrl,
} );
