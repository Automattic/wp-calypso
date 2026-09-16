import { userPurchasesQuery } from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from '@wordpress/element';
import { useExperiment } from 'calypso/lib/explat';
import {
	isRenewingBeforeExpiration,
	isSubscription,
} from 'calypso/me/purchases/lib/raw-purchase-helpers';
import { useSelector } from 'calypso/state';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import {
	RESURRECTED_FREE_USERS_EXPERIMENT,
	RESURRECTION_DAY_LIMIT_3M,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
	WELCOME_BACK_90_DAY_ELIGIBILITY_FLAG,
	WELCOME_BACK_MODAL_FORCE_FLAG,
	WELCOME_BACK_VARIATION_MANUAL,
} from './constants';
import { hasExceededDormancyThreshold } from './utils';
import type { Purchase } from '@automattic/api-core';

interface EligibilityResult {
	isLoading: boolean;
	isResurrectedSixMonths: boolean;
	isResurrectedThreeMonths: boolean;
	hasActivePaidSubscription: boolean | null;
	isEligible: boolean;
	variationName: string | null;
	isForcedVariation: boolean;
}

function hasActivePaidSubscription( purchases: Purchase[] | undefined ): boolean | null {
	if ( ! purchases ) {
		return null;
	}

	return purchases.some(
		( purchase ) => isSubscription( purchase ) && isRenewingBeforeExpiration( purchase )
	);
}

export function useResurrectedFreeUserEligibility(): EligibilityResult {
	const userSettings = useSelector( getUserSettings );
	const isUserSettingsFetching = useSelector( isFetchingUserSettings );

	const { data: purchases, isPending: isLoadingPurchases } = useQuery( userPurchasesQuery() );

	const rawLastSeen = userSettings?.last_admin_activity_timestamp;
	let lastSeen: number | null = null;
	if ( typeof rawLastSeen === 'number' ) {
		lastSeen = rawLastSeen;
	} else if ( rawLastSeen !== undefined && rawLastSeen !== null ) {
		const numericLastSeen = Number( rawLastSeen );
		if ( Number.isFinite( numericLastSeen ) ) {
			lastSeen = numericLastSeen;
		}
	}
	const isResurrectedSixMonths = useMemo(
		() => hasExceededDormancyThreshold( lastSeen, RESURRECTION_DAY_LIMIT_EXPERIMENT ),
		[ lastSeen ]
	);
	const isResurrectedThreeMonths = useMemo(
		() => hasExceededDormancyThreshold( lastSeen, RESURRECTION_DAY_LIMIT_3M ),
		[ lastSeen ]
	);

	const hasActiveSubscriptions = useMemo(
		() => hasActivePaidSubscription( purchases ),
		[ purchases ]
	);

	const isResurrected = config.isEnabled( WELCOME_BACK_90_DAY_ELIGIBILITY_FLAG )
		? isResurrectedThreeMonths
		: isResurrectedSixMonths;
	const baseEligibility = isResurrected && hasActiveSubscriptions === false;
	const [ isExperimentLoading, experimentAssignment ] = useExperiment(
		RESURRECTED_FREE_USERS_EXPERIMENT,
		{
			isEligible: baseEligibility,
		}
	);

	const variationName = experimentAssignment?.variationName ?? WELCOME_BACK_VARIATION_MANUAL;
	const isForcedByFlag = config.isEnabled( WELCOME_BACK_MODAL_FORCE_FLAG );
	const experimentReady = ! isExperimentLoading && !! variationName;

	if ( isForcedByFlag ) {
		return {
			isLoading: false,
			isResurrectedSixMonths,
			isResurrectedThreeMonths,
			hasActivePaidSubscription: hasActiveSubscriptions,
			isEligible: true,
			variationName,
			isForcedVariation: true,
		};
	}

	const isLoading =
		isUserSettingsFetching || isLoadingPurchases || ( baseEligibility && isExperimentLoading );

	return {
		isLoading,
		isResurrectedSixMonths,
		isResurrectedThreeMonths,
		hasActivePaidSubscription: hasActiveSubscriptions,
		isEligible: baseEligibility && experimentReady,
		variationName,
		isForcedVariation: false,
	};
}
