/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Whether the signup site preview is visible
 * @param   {object}  state The current client state
 * @return  {Boolean}       Whether the signup site preview is visible
 */
export const isSitePreviewVisible = state =>
	get( state, [ 'signup', 'preview', 'isVisible' ], false );
