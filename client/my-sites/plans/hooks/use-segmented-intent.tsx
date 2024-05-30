import { SKIP_ANSWER_KEY } from 'calypso/components/segmentation-survey/constants';

type SurveyData = {
	'what-are-your-goals': string[];
	'what-brings-you-to-wordpress': string[];
};

export function getSegmentedIntent( answers: SurveyData ): string | undefined {
	const surveyedGoals = answers[ 'what-are-your-goals' ];
	const surveyedIntent = answers[ 'what-brings-you-to-wordpress' ]?.[ 0 ];

	// Return default wpcom plans for migration flow.
	if ( surveyedIntent === 'migrate-or-import-site' && surveyedGoals.includes( SKIP_ANSWER_KEY ) ) {
		return undefined;
	}

	if ( surveyedIntent === 'client' ) {
		return 'plans-guided-segment-developer-or-agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( surveyedIntent === 'myself-business-or-friend' ) {
		if (
			surveyedGoals.length === 0 ||
			surveyedGoals.includes( SKIP_ANSWER_KEY ) ||
			surveyedGoals.includes( 'newsletter' ) ||
			surveyedGoals.includes( 'difm' )
		) {
			return undefined;
		}
		if ( surveyedGoals.includes( 'sell' ) && ! surveyedGoals.includes( 'difm' ) ) {
			return 'plans-guided-segment-merchant';
		}
		if ( surveyedGoals.includes( 'blog' ) ) {
			return 'plans-guided-segment-blogger';
		}
		if ( surveyedGoals.includes( 'educational-or-nonprofit' ) ) {
			return 'plans-guided-segment-nonprofit';
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'plans-guided-segment-consumer-or-business';
	}

	// Default return if no conditions are met
	return undefined;
}
