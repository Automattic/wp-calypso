import wpcom from 'calypso/lib/wp';
import { GUIDED_FLOW_SEGMENTATION_SURVEY_KEY } from 'calypso/signup/steps/initial-intent/constants';

export async function getSegmentedIntent() {
	const response = await wpcom.req.get( {
		path: `/segmentation-survey/answers?survey_key=${ GUIDED_FLOW_SEGMENTATION_SURVEY_KEY }`,
		apiNamespace: 'wpcom/v2',
	} );

	const goals = response[ 0 ]?.answers[ 'what-are-your-goals' ];
	const intent = response[ 0 ]?.answers[ 'what-brings-you-to-wordpress' ];

	if ( ! intent || ! goals ) {
		return null;
	}

	// Handle the case when no goals are provided (n/a)
	if ( intent === 'migrate-or-import-site' && goals.includes( 'skip' ) ) {
		return 'plans-intent-migration';
	}

	if ( intent === 'client' && goals.includes( 'skip' ) ) {
		return 'plans-intent-developer-or-agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( intent === 'myself-business-or-friend' ) {
		if ( goals.length === 0 ) {
			return null;
		}
		if ( goals.includes( 'difm' ) ) {
			return 'plans-intent-difm'; // Do it for me
		}
		if ( goals.includes( 'sell' ) && ! goals.includes( 'difm' ) ) {
			return 'plans-intent-merchant';
		}
		if ( goals.includes( 'blog' ) ) {
			return 'plans-intent-blogger';
		}
		if ( goals.includes( 'educational-or-nonprofit' ) ) {
			return 'plans-intent-nonprofit';
		}
		if ( goals.includes( 'newsletter' ) ) {
			return 'plans-intent-newsletter';
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'plans-intent-consumer-or-business';
	}

	// Default return if no conditions are met
	return null;
}
