/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if WebPreview is currently showing.
 *
 * @param  {Object}  state Global state tree
 * @return {bool}    True if currently showing WebPreview
 *
 * @see client/components/web-preview
 */
export default function isPreviewShowing( state ) {
	return get( state.ui, 'isPreviewShowing', false );
}
