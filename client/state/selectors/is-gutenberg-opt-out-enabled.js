/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getSelectedEditor from 'state/selectors/get-selected-editor';
import isClassicEditorForced from 'state/selectors/is-classic-editor-forced';

export const isGutenbergOptOutEnabled = ( state, siteId ) => {
	return (
		get( state, [ 'gutenbergOptInOut', siteId, 'optOut' ], false ) &&
		getSelectedEditor( state, siteId ) !== 'classic' &&
		! isClassicEditorForced( state, siteId )
	);
};

export default isGutenbergOptOutEnabled;
