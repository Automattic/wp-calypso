/**
 * Internal dependencies
 */
import { getSelectedEditor } from 'state/selectors/get-selected-editor';
import inEditorDeprecationGroup from 'state/editor-deprecation-group/selectors/in-editor-deprecation-group';

export const shouldLoadGutenberg = ( state, siteId ) => {
	const validEditors = [ 'gutenberg-iframe', 'gutenberg-redirect', 'gutenberg-redirect-and-style' ];
	const selectedEditor = getSelectedEditor( state, siteId );
	return inEditorDeprecationGroup( state ) || validEditors.indexOf( selectedEditor ) > -1;
};

export default shouldLoadGutenberg;
