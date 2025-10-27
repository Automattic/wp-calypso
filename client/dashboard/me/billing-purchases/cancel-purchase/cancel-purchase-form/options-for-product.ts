import { isJetpackPlan } from '../../../../utils/plans';
import {
	isDomainRegistration,
	isDomainTransfer,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from '../../../../utils/purchase';
import {
	CANCELLATION_REASONS,
	DOMAIN_TRANSFER_CANCELLATION_REASONS,
	DOMAIN_REGISTRATION_CANCELLATION_REASONS,
	JETPACK_CANCELLATION_REASONS,
	GSUITE_CANCELLATION_REASONS,
} from './cancellation-reasons';

type WithProductSlug = Parameters< typeof isJetpackPlan >[ 0 ];

//used
export const cancellationOptionsForPurchase = ( purchase: WithProductSlug ) => {
	if ( isGSuiteOrGoogleWorkspaceProductSlug( purchase?.product_slug ) ) {
		return [
			...GSUITE_CANCELLATION_REASONS.map( ( { value } ) => value ),
			'downgradeToAnotherPlan',
		];
	}

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

//used
export const nextAdventureOptionsForPurchase = ( purchase: WithProductSlug ) => {
	if ( isJetpackPlan( purchase ) ) {
		return [ 'stayingHere', 'otherPlugin', 'leavingWP', 'noNeed' ];
	}

	if ( isDomainTransfer( purchase ) ) {
		return [];
	}

	return [ 'stayingHere', 'otherWordPress', 'differentService', 'noNeed' ];
};
