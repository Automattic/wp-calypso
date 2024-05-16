export function determineSegment( intent: string, goals: string[] ) {
	// Handle the case when no goals are provided (n/a)
	if ( intent === 'Migrate or import' && goals.length === 0 ) {
		return 'Migration';
	}

	if ( intent === 'Create for clients' && goals.length === 0 ) {
		return 'Developer / Agency';
	}

	// Handle different cases when intent is 'Create for self'
	if ( intent === 'Create for self' ) {
		if ( goals.length === 0 ) {
			return 'Unknown';
		}
		if ( goals.includes( 'Get a website built quickly' ) ) {
			return 'DIFM'; // Do it for me
		}
		if ( goals.includes( 'Sell something' ) && ! goals.includes( 'Get a website built quickly' ) ) {
			return 'Merchant';
		}
		if ( goals.includes( 'Publish a blog' ) || goals.includes( 'Educational/nonprofit' ) ) {
			return 'Blogger';
		}
		if ( goals.includes( 'Create a newsletter' ) ) {
			return 'Newsletter';
		}
		// Catch-all case for when none of the specific goals are met
		return 'Consumer / Business';
	}

	// Default return if no conditions are met
	return 'Unrecognized';
}

export function useSegmentedPlans( segment: string ) {
	switch ( segment ) {
		case 'Unknown':
			return [
				'TYPE_FREE',
				'TYPE_STARTER',
				'TYPE_EXPLORER',
				'TYPE_CREATOR',
				'TYPE_ENTREPRENEUR',
				'TYPE_ENTERPRISE',
			];
		case 'Blogger':
			return [ 'TYPE_FREE', 'TYPE_STARTER', 'TYPE_EXPLORER', 'TYPE_CREATOR' ];
		case 'Consumer':
		case 'Business':
			return [ 'TYPE_STARTER', 'TYPE_EXPLORER', 'TYPE_CREATOR' ];
		case 'Merchant':
			return [ 'TYPE_CREATOR', 'TYPE_ENTREPRENEUR', 'TYPE_ENTERPRISE' ];
		case 'Developer':
		case 'Agency':
			return [ 'TYPE_CREATOR', 'TYPE_ENTREPRENEUR', 'TYPE_ENTERPRISE' ];
		default:
			return []; // Return an empty array if the segment is not recognized
	}
}
