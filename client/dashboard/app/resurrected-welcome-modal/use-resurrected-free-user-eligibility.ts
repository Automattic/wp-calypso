import { userPurchasesQuery, userSettingsQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useExperiment } from 'calypso/lib/explat';
import {
	RESURRECTED_FREE_USERS_EXPERIMENT,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
	WELCOME_BACK_MODAL_FORCE_FLAG,
	WELCOME_BACK_VARIATION_MANUAL,
} from './constants';
import type { Purchase } from '@automattic/api-core';

const SECONDS_PER_DAY = 24 * 60 * 60;

export interface EligibilityResult {
	isLoading: boolean;
	isResurrectedSixMonths: boolean;
	hasActivePaidSubscription: boolean | null;
	isEligible: boolean;
	variationName: string;
	isForcedVariation: boolean;
}

function hasExceededDormancyThreshold( lastSeen: number | string | undefined ): boolean {
	const numericLastSeen = Number( lastSeen );

	if ( ! Number.isFinite( numericLastSeen ) ) {
		return false;
	}

	const threshold =
		Math.floor( Date.now() / 1000 ) - RESURRECTION_DAY_LIMIT_EXPERIMENT * SECONDS_PER_DAY;

	return numericLastSeen < threshold;
}

function hasActivePaidSubscription( purchases: Purchase[] | undefined ): boolean | null {
	if ( ! purchases ) {
		return null;
	}

	return purchases.some(
		( purchase ) =>
			! purchase.is_domain_registration &&
			purchase.expiry_status !== 'one-time-purchase' &&
			[ 'active', 'auto-renewing' ].includes( purchase.expiry_status )
	);
}

export function useResurrectedFreeUserEligibility(): EligibilityResult {
	const userSettingsQueryResult = useQuery( userSettingsQuery() );
	const userPurchasesQueryResult = useQuery( userPurchasesQuery() );

	const isResurrectedSixMonths = hasExceededDormancyThreshold(
		userSettingsQueryResult.data?.last_admin_activity_timestamp
	);
	const hasActiveSubscriptions = hasActivePaidSubscription( userPurchasesQueryResult.data );
	const baseEligibility = isResurrectedSixMonths && hasActiveSubscriptions === false;

	const [ isExperimentLoading, experimentAssignment ] = useExperiment(
		RESURRECTED_FREE_USERS_EXPERIMENT,
		{
			isEligible: baseEligibility,
		}
	);

	const variationName = experimentAssignment?.variationName ?? WELCOME_BACK_VARIATION_MANUAL;
	const isForcedByFlag = config.isEnabled( WELCOME_BACK_MODAL_FORCE_FLAG );

	if ( isForcedByFlag ) {
		return {
			isLoading: false,
			isResurrectedSixMonths,
			hasActivePaidSubscription: hasActiveSubscriptions,
			isEligible: true,
			variationName,
			isForcedVariation: true,
		};
	}

	const isLoading =
		userSettingsQueryResult.isPending ||
		userPurchasesQueryResult.isPending ||
		( baseEligibility && isExperimentLoading );

	return {
		isLoading,
		isResurrectedSixMonths,
		hasActivePaidSubscription: hasActiveSubscriptions,
		isEligible: baseEligibility && ! isExperimentLoading,
		variationName,
		isForcedVariation: false,
	};
}
