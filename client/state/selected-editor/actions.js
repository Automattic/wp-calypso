/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_SET } from 'state/action-types';
import 'state/data-layer/wpcom/sites/gutenberg';

export const setSelectedEditor = ( siteId, editor ) => ( {
	type: EDITOR_TYPE_SET,
	siteId,
	editor,
} );
