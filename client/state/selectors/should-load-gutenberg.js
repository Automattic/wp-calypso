/**
 * Internal dependencies
 */
import { getSelectedEditor } from 'state/selectors/get-selected-editor';

export const shouldLoadGutenberg = ( state, siteId ) => {
	const validEditors = [ 'gutenberg-iframe', 'gutenberg-redirect', 'gutenberg-redirect-and-style' ];
	const selectedEditor = getSelectedEditor( state, siteId );
	return validEditors.indexOf( selectedEditor ) > -1;
};

export default shouldLoadGutenberg;
