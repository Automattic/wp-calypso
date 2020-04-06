/**
 * External dependencies
 */

import { get } from 'lodash';

export function isNpsSurveyDialogShowing( state ) {
	return get( state.ui, 'npsSurveyNotice.isNpsSurveyDialogShowing', false );
}
