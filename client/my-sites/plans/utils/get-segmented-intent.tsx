import { SKIP_ANSWER_KEY } from 'calypso/components/segmentation-survey/constants';
import { SurveyData, SegmentedIntent } from 'calypso/signup/steps/initial-intent/types';

export function getSegmentedIntent( answers?: SurveyData ): SegmentedIntent {
	const surveyedGoals = answers?.[ 'what-are-your-goals' ];
	const surveyedIntent = answers?.[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	// Return default wpcom plans for migration flow.
	if ( surveyedIntent === 'import' && surveyedGoals?.includes( SKIP_ANSWER_KEY ) ) {
		return { segmentSlug: undefined, segment: 'migration' };
	}

	if ( surveyedIntent === 'host-site' ) {
		return {
			segmentSlug: 'plans-guided-segment-developer-or-agency',
			segment: 'developer-or-agency',
		};
	}

	// Handle different cases when intent is 'Create for self'
	if ( surveyedIntent === 'build' ) {
		if ( surveyedGoals?.length === 0 || surveyedGoals?.includes( SKIP_ANSWER_KEY ) ) {
			return { segmentSlug: undefined, segment: 'unknown' };
		}

		if ( surveyedGoals?.includes( 'difm' ) ) {
			return { segmentSlug: undefined, segment: 'difm' };
		}

		if ( surveyedGoals?.includes( 'sell' ) && ! surveyedGoals?.includes( 'difm' ) ) {
			return { segmentSlug: 'plans-guided-segment-merchant', segment: 'merchant' };
		}
		if ( surveyedGoals?.includes( 'write' ) && surveyedGoals?.length === 1 ) {
			return { segmentSlug: 'plans-guided-segment-blogger', segment: 'blogger' };
		}
		if ( surveyedGoals?.includes( 'educational-or-nonprofit' ) && surveyedGoals?.length === 1 ) {
			return { segmentSlug: 'plans-guided-segment-nonprofit', segment: 'nonprofit' };
		}

		if ( surveyedGoals?.includes( 'newsletter' ) && surveyedGoals?.length === 1 ) {
			return { segmentSlug: undefined, segment: 'newsletter' };
		}

		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition

		return {
			segmentSlug: 'plans-guided-segment-consumer-or-business',
			segment: 'consumer-or-business',
		};
	}

	// Default return if no conditions are met
	return { segmentSlug: undefined, segment: 'unknown' };
}
