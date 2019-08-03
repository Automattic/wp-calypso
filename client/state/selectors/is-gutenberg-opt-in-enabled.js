/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSelectedEditor from 'state/selectors/get-selected-editor';
import isClassicEditorForced from 'state/selectors/is-classic-editor-forced';

export const isGutenbergOptInEnabled = ( state, siteId ) => {
	return (
		get( state, [ 'gutenbergOptIn', siteId ], false ) &&
		getSelectedEditor( state, siteId ) === 'classic' &&
		! isClassicEditorForced( state, siteId )
	);
};

export default isGutenbergOptInEnabled;
