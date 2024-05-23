const useGuidedFlowGetSegment = ( intent: string, goals: string[] ): string => {
	// Handle the case when no goals are provided (n/a)
	if ( intent === 'migrate-or-import-site' && goals.length === 0 ) {
		return 'Migration';
	}

	if ( intent === 'client' && goals.length === 0 ) {
		return 'Developer / Agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( intent === 'myself-business-or-friend' ) {
		if ( goals.length === 0 ) {
			return 'Unknown';
		}
		if ( goals.includes( 'difm' ) ) {
			return 'DIFM'; // Do it for me
		}
		if ( goals.includes( 'sell' ) && ! goals.includes( 'difm' ) ) {
			return 'Merchant';
		}
		if ( goals.includes( 'blog' ) ) {
			return 'Blogger';
		}
		if ( goals.includes( 'educational-or-nonprofit' ) ) {
			return 'Nonprofit';
		}
		if ( goals.includes( 'newsletter' ) ) {
			return 'Newsletter';
		}
		// Catch-all case for when none of the specific goals are met
		// This will also account for "( ! DIFM && ! Sell ) = Consumer / Business" condition
		return 'Consumer / Business';
	}

	// Default return if no conditions are met
	return 'Unrecognized';
};

export default useGuidedFlowGetSegment;
