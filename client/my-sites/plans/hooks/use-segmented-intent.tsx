import useSurveyAnswersQuery from 'calypso/data/segmentaton-survey/queries/use-survey-answers-query';
import { GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } from 'calypso/signup/steps/initial-intent/constants';

export function useSegmentedIntent() {
	const { data } = useSurveyAnswersQuery( { surveyKey: GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } );

	const goals = data?.[ 'what-are-your-goals' ];
	const intent = data?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	if ( ! intent || ! goals ) {
		return null;
	}

	// Return null (show all plans) for migration flow.
	if ( intent === 'migrate-or-import-site' && goals.includes( 'skip' ) ) {
		return null;
	}

	if ( intent === 'client' && goals.includes( 'skip' ) ) {
		return 'plans-segment-developer-or-agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( intent === 'myself-business-or-friend' ) {
		if ( goals.length === 0 ) {
			return null;
		}
		if ( goals.includes( 'difm' ) ) {
			// Return null (show all plans) for DIFM (do it for me) flow.
			return null;
		}
		if ( goals.includes( 'sell' ) && ! goals.includes( 'difm' ) ) {
			return 'plans-segment-merchant';
		}
		if ( goals.includes( 'blog' ) ) {
			return 'plans-segment-blogger';
		}
		if ( goals.includes( 'educational-or-nonprofit' ) ) {
			return 'plans-segment-nonprofit';
		}
		if ( goals.includes( 'newsletter' ) ) {
			// Return null (show all plans) for newsletter flow.
			return null;
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'plans-segment-consumer-or-business';
	}

	// Default return if no conditions are met
	return null;
}
