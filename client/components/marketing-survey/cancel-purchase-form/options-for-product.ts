import {
	isDomainRegistration,
	isDomainTransfer,
	isJetpackPlan,
} from '@automattic/calypso-products';
import {
	CANCELLATION_REASONS,
	DOMAIN_TRANSFER_CANCELLATION_REASONS,
	DOMAIN_REGISTRATION_CANCELLATION_REASONS,
	JETPACK_CANCELLATION_REASONS,
} from './cancellation-reasons';
import type { Purchase } from '@automattic/calypso-products';

export const cancellationOptionsForPurchase = ( purchase: Purchase ) => {
	if ( isJetpackPlan( purchase ) ) {
		return [
			...JETPACK_CANCELLATION_REASONS.map( ( { value } ) => value ),
			'downgradeToAnotherPlan',
		];
	}

	if ( isDomainTransfer( purchase ) ) {
		return DOMAIN_TRANSFER_CANCELLATION_REASONS.map( ( { value } ) => value );
	}

	if ( isDomainRegistration( purchase ) ) {
		return DOMAIN_REGISTRATION_CANCELLATION_REASONS.map( ( { value } ) => value );
	}

	return CANCELLATION_REASONS.map( ( { value } ) => value );
};

export const nextAdventureOptionsForPurchase = ( purchase: Purchase ) => {
	if ( isJetpackPlan( purchase ) ) {
		return [ 'stayingHere', 'otherPlugin', 'leavingWP', 'noNeed' ];
	}

	if ( isDomainTransfer( purchase ) ) {
		return [];
	}

	if ( isDomainRegistration( purchase ) ) {
		return [];
	}

	return [ 'stayingHere', 'otherWordPress', 'differentService', 'noNeed' ];
};
