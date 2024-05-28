import { PlansIntent } from '@automattic/plans-grid-next';
import useSurveyAnswersQuery from 'calypso/data/segmentaton-survey/queries/use-survey-answers-query';
import { GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } from 'calypso/signup/steps/initial-intent/constants';

/**
 * Returns the segmented intent based on the survey answers.
 * @param enabled whether the survey answers should be fetched.
 * @param fallback the default intent to return if the survey answers are not available or the query is disabled.
 * @returns the segmented intent
 */
export function useSegmentedIntent(
	enabled = false,
	fallback: PlansIntent = 'plans-default-wpcom'
): PlansIntent {
	const { data } = useSurveyAnswersQuery( {
		surveyKey: GUIDED_FLOW_SEGMENTATION_SURVEY_KEY,
		enabled,
	} );

	const goals = data?.[ 'what-are-your-goals' ];
	const intent = data?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	if ( ! enabled || ! intent || ! goals ) {
		return fallback;
	}

	// Return default wpcom plans for migration flow.
	if ( intent === 'migrate-or-import-site' && goals.includes( 'skip' ) ) {
		return fallback;
	}

	if ( intent === 'client' && goals.includes( 'skip' ) ) {
		return 'plans-segment-developer-or-agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( intent === 'myself-business-or-friend' ) {
		if ( goals.length === 0 ) {
			return fallback;
		}
		if ( goals.includes( 'difm' ) ) {
			return fallback;
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
			return fallback;
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'plans-segment-consumer-or-business';
	}

	// Default return if no conditions are met
	return fallback;
}
