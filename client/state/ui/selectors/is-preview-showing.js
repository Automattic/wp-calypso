/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if WebPreview is currently showing.
 *
 * @param  {object}  state Global state tree
 * @returns {bool}    True if currently showing WebPreview
 *
 * @see client/components/web-preview
 */
export default function isPreviewShowing( state ) {
	return get( state.ui, 'isPreviewShowing', false );
}
