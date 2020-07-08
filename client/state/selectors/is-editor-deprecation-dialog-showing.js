/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isEditorDeprecationDialogShowing( state ) {
	return get( state, 'ui.editorDeprecationDialog.isShowing', true );
}
