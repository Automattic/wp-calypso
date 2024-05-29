import { PlansIntent } from '@automattic/plans-grid-next';
import useSurveyAnswersQuery from 'calypso/data/segmentaton-survey/queries/use-survey-answers-query';
import { GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } from 'calypso/signup/steps/initial-intent/constants';

/**
 * Returns the segmented intent based on the survey answers.
 * @param enabled whether the survey answers should be fetched.
 * @param blogId the blogId we want the answers from. Answers are mapped to sites (can be zero when a site does not exist yet).
 * @param fallback the default intent to return if the survey answers are not available or the query is disabled.
 * @returns the segmented intent
 */
export function useSegmentedIntent(
	enabled = false,
	blogId: number | null | undefined,
	fallback: PlansIntent | undefined
): { segment: PlansIntent | undefined; isFetchingSegment: boolean } {
	const { isFetching, data } = useSurveyAnswersQuery( {
		surveyKey: GUIDED_FLOW_SEGMENTATION_SURVEY_KEY,
		enabled,
	} );

	// The survey API uses blog_id = 0 when the site is unknown.
	blogId = blogId || 0;

	const surveyedGoals = data?.[ blogId ]?.[ 'what-are-your-goals' ];
	const surveyedIntent = data?.[ blogId ]?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	if ( ! enabled ) {
		return { segment: fallback, isFetchingSegment: false };
	}

	if ( ! surveyedIntent || ! surveyedGoals ) {
		return { segment: fallback, isFetchingSegment: isFetching };
	}

	// Return default wpcom plans for migration flow.
	if ( surveyedIntent === 'migrate-or-import-site' && surveyedGoals.includes( 'skip' ) ) {
		return { segment: fallback, isFetchingSegment: isFetching };
	}

	if ( surveyedIntent === 'client' ) {
		return { segment: 'plans-guided-segment-developer-or-agency', isFetchingSegment: isFetching };
	}

	// Handle different cases when intent is 'Create for self'
	if ( surveyedIntent === 'myself-business-or-friend' ) {
		if (
			surveyedGoals.length === 0 ||
			surveyedGoals.includes( 'skip' ) ||
			surveyedGoals.includes( 'newsletter' ) ||
			surveyedGoals.includes( 'difm' )
		) {
			return { segment: fallback, isFetchingSegment: isFetching };
		}
		if ( surveyedGoals.includes( 'sell' ) && ! surveyedGoals.includes( 'difm' ) ) {
			return { segment: 'plans-guided-segment-merchant', isFetchingSegment: isFetching };
		}
		if ( surveyedGoals.includes( 'blog' ) ) {
			return { segment: 'plans-guided-segment-blogger', isFetchingSegment: isFetching };
		}
		if ( surveyedGoals.includes( 'educational-or-nonprofit' ) ) {
			return { segment: 'plans-guided-segment-nonprofit', isFetchingSegment: isFetching };
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return { segment: 'plans-guided-segment-consumer-or-business', isFetchingSegment: isFetching };
	}

	// Default return if no conditions are met
	return { segment: fallback, isFetchingSegment: isFetching };
}
