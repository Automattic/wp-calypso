/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Whether the signup site preview is visible
 * @param   {object}  state The current client state
 * @returns  {boolean}       Whether the signup site preview is visible
 */
export const isSitePreviewVisible = state =>
	get( state, [ 'signup', 'preview', 'isVisible' ], false );
