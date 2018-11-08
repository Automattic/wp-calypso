/** @format */

/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isGutenbergBlocksWarningDialogShowing( state ) {
	return get( state, 'ui.gutenbergBlocksWarningDialog.isShowing', false );
}
