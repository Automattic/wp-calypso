/**
 * Internal dependencies
 */
import { getSelectedEditor } from 'state/selectors/get-selected-editor';

export const shouldRedirectGutenberg = ( state, siteId ) => {
	const validEditors = [ 'gutenberg-redirect', 'gutenberg-redirect-and-style' ];
	const selectedEditor = getSelectedEditor( state, siteId );
	return validEditors.indexOf( selectedEditor ) > -1;
};

export default shouldRedirectGutenberg;
