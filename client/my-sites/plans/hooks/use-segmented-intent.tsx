import { PlansIntent } from '@automattic/plans-grid-next';
import { SKIP_ANSWER_KEY } from 'calypso/components/segmentation-survey';
import useSurveyAnswersQuery from 'calypso/data/segmentaton-survey/queries/use-survey-answers-query';
import { GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } from 'calypso/signup/steps/initial-intent/constants';

/**
 * Returns the segmented intent based on the survey answers.
 * @param enabled whether the survey answers should be fetched.
 * @param blogId the blogId we want the answers from. Answers are mapped to sites (can be zero when a site does not exist yet).
 * @returns the segmented intent
 */
export function useSegmentedIntent(
	enabled = false,
	blogId: number | null | undefined
): { segment?: PlansIntent | undefined; isLoadingSegment: boolean } {
	const { isLoading, data } = useSurveyAnswersQuery( {
		surveyKey: GUIDED_FLOW_SEGMENTATION_SURVEY_KEY,
		enabled,
	} );

	// The survey API uses blog_id = 0 when the site is unknown.
	blogId = blogId || 0;

	const surveyedGoals = data?.[ blogId ]?.[ 'what-are-your-goals' ];
	const surveyedIntent = data?.[ blogId ]?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	if ( ! enabled ) {
		return { isLoadingSegment: false };
	}

	if ( ! surveyedIntent || ! surveyedGoals ) {
		return { isLoadingSegment: isLoading };
	}

	// Return default wpcom plans for migration flow.
	if ( surveyedIntent === 'migrate-or-import-site' && surveyedGoals.includes( SKIP_ANSWER_KEY ) ) {
		return { isLoadingSegment: isLoading };
	}

	if ( surveyedIntent === 'client' ) {
		return { segment: 'plans-guided-segment-developer-or-agency', isLoadingSegment: isLoading };
	}

	// Handle different cases when intent is 'Create for self'
	if ( surveyedIntent === 'myself-business-or-friend' ) {
		if (
			surveyedGoals.length === 0 ||
			surveyedGoals.includes( SKIP_ANSWER_KEY ) ||
			surveyedGoals.includes( 'newsletter' ) ||
			surveyedGoals.includes( 'difm' )
		) {
			return { isLoadingSegment: isLoading };
		}
		if ( surveyedGoals.includes( 'sell' ) && ! surveyedGoals.includes( 'difm' ) ) {
			return { segment: 'plans-guided-segment-merchant', isLoadingSegment: isLoading };
		}
		if ( surveyedGoals.includes( 'blog' ) ) {
			return { segment: 'plans-guided-segment-blogger', isLoadingSegment: isLoading };
		}
		if ( surveyedGoals.includes( 'educational-or-nonprofit' ) ) {
			return { segment: 'plans-guided-segment-nonprofit', isLoadingSegment: isLoading };
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return { segment: 'plans-guided-segment-consumer-or-business', isLoadingSegment: isLoading };
	}

	// Default return if no conditions are met
	return { isLoadingSegment: isLoading };
}
