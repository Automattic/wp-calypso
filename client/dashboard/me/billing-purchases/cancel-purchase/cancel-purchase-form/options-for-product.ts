import { isGSuiteOrGoogleWorkspaceProductSlug } from '../../../../utils/purchase';
import {
	CANCELLATION_REASONS,
	DOMAIN_TRANSFER_CANCELLATION_REASONS,
	DOMAIN_REGISTRATION_CANCELLATION_REASONS,
	JETPACK_CANCELLATION_REASONS,
	GSUITE_CANCELLATION_REASONS,
} from './cancellation-reasons';
import type { Purchase } from '@automattic/api-core';

export const cancellationOptionsForPurchase = ( purchase: Purchase ) => {
	if ( isGSuiteOrGoogleWorkspaceProductSlug( purchase?.product_slug ) ) {
		return [
			...GSUITE_CANCELLATION_REASONS.map( ( { value } ) => value ),
			'downgradeToAnotherPlan',
		];
	}

	if ( purchase.is_jetpack_plan_or_product ) {
		return [
			...JETPACK_CANCELLATION_REASONS.map( ( { value } ) => value ),
			'downgradeToAnotherPlan',
		];
	}

	if ( 'domain_transfer' === purchase.product_slug ) {
		return DOMAIN_TRANSFER_CANCELLATION_REASONS.map( ( { value } ) => value );
	}
	if ( purchase.is_domain_registration ) {
		return DOMAIN_REGISTRATION_CANCELLATION_REASONS.map( ( { value } ) => value );
	}

	return CANCELLATION_REASONS.map( ( { value } ) => value );
};

export const nextAdventureOptionsForPurchase = ( purchase: Purchase ) => {
	if ( purchase.is_jetpack_plan_or_product ) {
		return [ 'stayingHere', 'otherPlugin', 'leavingWP', 'noNeed' ];
	}

	if ( 'domain_transfer' === purchase.product_slug ) {
		return [];
	}

	return [ 'stayingHere', 'otherWordPress', 'differentService', 'noNeed' ];
};
