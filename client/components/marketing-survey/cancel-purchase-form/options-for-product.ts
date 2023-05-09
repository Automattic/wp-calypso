import { isDomainTransfer, isJetpackPlan } from '@automattic/calypso-products';
import {
	CANCELLATION_REASONS,
	DOMAIN_TRANSFER_CANCELLATION_REASONS,
	JETPACK_CANCELLATION_REASONS,
} from './cancellation-reasons';

type WithProductSlug = Parameters< typeof isJetpackPlan >[ 0 ];

export const cancellationOptionsForPurchase = ( purchase: WithProductSlug ) => {
	if ( isJetpackPlan( purchase ) ) {
		return [
			...JETPACK_CANCELLATION_REASONS.map( ( { value } ) => value ),
			'downgradeToAnotherPlan',
		];
	}

	if ( isDomainTransfer( purchase ) ) {
		return DOMAIN_TRANSFER_CANCELLATION_REASONS.map( ( { value } ) => value );
	}

	return CANCELLATION_REASONS.map( ( { value } ) => value );
};

export const nextAdventureOptionsForPurchase = ( purchase: WithProductSlug ) => {
	if ( isJetpackPlan( purchase ) ) {
		return [ 'stayingHere', 'otherPlugin', 'leavingWP', 'noNeed' ];
	}

	if ( isDomainTransfer( purchase ) ) {
		return [];
	}

	return [ 'stayingHere', 'otherWordPress', 'differentService', 'noNeed' ];
};
