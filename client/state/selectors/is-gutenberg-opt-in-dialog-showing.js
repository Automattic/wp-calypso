/**
 * External dependencies
 */

import { get } from 'lodash';

export default function isGutenbergOptInDialogShowing( state ) {
	return get( state, 'ui.gutenbergOptInDialog.isShowing', false );
}
