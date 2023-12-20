import type { Plans } from '@automattic/calypso-e2e';

export function getNewPlanName( planName: Plans ) {
	if ( planName === 'Personal' ) {
		return 'Starter';
	} else if ( planName === 'Premium' ) {
		return 'Explorer';
	} else if ( planName === 'Business' ) {
		return 'Creator';
	} else if ( planName === 'eCommerce' ) {
		return 'Entrepreneur';
	}
	return planName;
}
