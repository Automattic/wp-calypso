const useGuidedFlowGetSegment = ( updatedAnswers: Record< string, string[] > ): string => {
	const intent = updatedAnswers?.[ 'what-brings-you-to-wordpress' ] || [];
	const goals = updatedAnswers?.[ 'what-are-your-goals' ] || [];

	// Handle the case when no goals are provided (n/a)
	if ( intent?.includes( 'migrate-or-import-site' ) && goals?.length === 0 ) {
		return 'migration';
	}

	if ( intent?.includes( 'client' ) && goals?.length === 0 ) {
		return 'developer-or-agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( intent?.includes( 'myself-business-or-friend' ) ) {
		if ( goals?.length === 0 ) {
			return 'unknown';
		}
		if ( goals?.includes( 'difm' ) ) {
			return 'difm'; // Do it for me
		}
		if ( goals?.includes( 'sell' ) && ! goals?.includes( 'difm' ) ) {
			return 'merchant';
		}
		if ( goals?.includes( 'blog' ) ) {
			return 'blogger';
		}
		if ( goals?.includes( 'educational-or-nonprofit' ) ) {
			return 'nonprofit';
		}
		if ( goals?.includes( 'newsletter' ) ) {
			return 'newsletter';
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'consumer-or-business';
	}

	// Default return if no conditions are met
	return 'unknown';
};

export default useGuidedFlowGetSegment;
