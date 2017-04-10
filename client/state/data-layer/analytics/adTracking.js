/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import {
	trackCustomAdWordsRemarketingEvent,
	trackCustomFacebookConversionEvent,
} from 'lib/analytics/ad-tracking';
import { SIGNUP_STEPS_SURVEY_SET } from 'state/action-types';

function recordSelectedVertical( _, action, next ) {
	next( action );

	const vertical = get( action, 'survey.vertical' );

	if ( vertical ) {
		const attributes = { vertical };
		trackCustomFacebookConversionEvent( 'VerticalSelectedEvent', attributes );
		trackCustomAdWordsRemarketingEvent( attributes );
	}
}

export default {
	[ SIGNUP_STEPS_SURVEY_SET ]: [ recordSelectedVertical ]
};
