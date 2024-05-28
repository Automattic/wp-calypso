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

	const surveyedGoals = data?.[ 'what-are-your-goals' ];
	const surveyedIntent = data?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	if ( ! enabled || ! surveyedIntent || ! surveyedGoals ) {
		return fallback;
	}

	// Return default wpcom plans for migration flow.
	if ( surveyedIntent === 'migrate-or-import-site' && surveyedGoals.includes( 'skip' ) ) {
		return fallback;
	}

	if ( surveyedIntent === 'client' && surveyedGoals.includes( 'skip' ) ) {
		return 'plans-segment-developer-or-agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( surveyedIntent === 'myself-business-or-friend' ) {
		if (
			surveyedGoals.length === 0 ||
			surveyedGoals.includes( 'skip' ) ||
			surveyedGoals.includes( 'newsletter' ) ||
			surveyedGoals.includes( 'difm' )
		) {
			return fallback;
		}
		if ( surveyedGoals.includes( 'sell' ) && ! surveyedGoals.includes( 'difm' ) ) {
			return 'plans-segment-merchant';
		}
		if ( surveyedGoals.includes( 'blog' ) ) {
			return 'plans-segment-blogger';
		}
		if ( surveyedGoals.includes( 'educational-or-nonprofit' ) ) {
			return 'plans-segment-nonprofit';
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'plans-segment-consumer-or-business';
	}

	// Default return if no conditions are met
	return fallback;
}
