/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/nps-survey/init';

export function isNpsSurveyDialogShowing( state ) {
	return get( state, [ 'npsSurvey', 'notice', 'isNpsSurveyDialogShowing' ], false );
}
