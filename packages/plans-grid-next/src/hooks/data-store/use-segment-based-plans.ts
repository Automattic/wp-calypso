import {
	TYPE_BUSINESS,
	TYPE_ECOMMERCE,
	TYPE_ENTERPRISE_GRID_WPCOM,
	TYPE_FREE,
	TYPE_PERSONAL,
	TYPE_PREMIUM,
} from '@automattic/calypso-products';

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
				TYPE_FREE,
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				TYPE_ENTERPRISE_GRID_WPCOM,
			];
		case 'Blogger':
			return [ TYPE_FREE, TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
		case 'Consumer':
		case 'Business':
			return [ TYPE_PERSONAL, TYPE_PREMIUM, TYPE_BUSINESS ];
		case 'Merchant':
			return [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
		case 'Developer':
		case 'Agency':
			return [ TYPE_BUSINESS, TYPE_ECOMMERCE, TYPE_ENTERPRISE_GRID_WPCOM ];
		default:
			return [
				TYPE_FREE,
				TYPE_PERSONAL,
				TYPE_PREMIUM,
				TYPE_BUSINESS,
				TYPE_ECOMMERCE,
				TYPE_ENTERPRISE_GRID_WPCOM,
			];
	}
}
