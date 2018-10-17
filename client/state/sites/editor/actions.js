/** @format */

/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import { EDITOR_TYPE_SET } from 'state/action-types';

export const setSiteEditor = ( siteId, editor ) => ( {
	type: EDITOR_TYPE_SET,
	siteId,
	editor,
} );
