import config from '@automattic/calypso-config';
import { useEffect, useMemo } from '@wordpress/element';
import { useExperiment } from 'calypso/lib/explat';
import { isRenewingBeforeExpiration, isSubscription } from 'calypso/lib/purchases';
import { useDispatch, useSelector } from 'calypso/state';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { fetchUserPurchases } from 'calypso/state/purchases/actions';
import {
	getUserPurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import { isFetchingUserSettings } from 'calypso/state/user-settings/selectors';
import {
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
	WELCOME_BACK_MODAL_FORCE_FLAG,
	WELCOME_BACK_VARIATION_MANUAL,
	RESURRECTED_FREE_USERS_EXPERIMENT,
} from './constants';
import { hasExceededDormancyThreshold } from './utils';
import type { Purchase } from 'calypso/lib/purchases/types';

interface EligibilityResult {
	isLoading: boolean;
	isResurrectedSixMonths: boolean;
	hasActivePaidSubscription: boolean | null;
	isEligible: boolean;
	variationName: string | null;
	isForcedVariation: boolean;
}

function hasActivePaidSubscription( purchases: Purchase[] | null ): boolean | null {
	if ( purchases === null ) {
		return null;
	}

	return purchases.some(
		( purchase ) => isSubscription( purchase ) && isRenewingBeforeExpiration( purchase )
	);
}

export function useResurrectedFreeUserEligibility(): EligibilityResult {
	const dispatch = useDispatch();
	const userSettings = useSelector( getUserSettings );
	const isUserSettingsFetching = useSelector( isFetchingUserSettings );
	const currentUserId = useSelector( getCurrentUserId );

	const purchases = useSelector( getUserPurchases );
	const hasLoadedPurchases = useSelector( hasLoadedUserPurchasesFromServer );
	const isUserPurchasesFetching = useSelector( isFetchingUserPurchases );

	const purchasesLoaded = purchases !== null || hasLoadedPurchases;

	useEffect( () => {
		if ( purchasesLoaded || isUserPurchasesFetching || ! currentUserId ) {
			return;
		}

		dispatch( fetchUserPurchases( currentUserId ) );
	}, [ purchasesLoaded, isUserPurchasesFetching, currentUserId, dispatch ] );

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

	const hasActiveSubscriptions = useMemo(
		() => hasActivePaidSubscription( purchases ),
		[ purchases ]
	);

	const baseEligibility = isResurrectedSixMonths && hasActiveSubscriptions === false;
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
			hasActivePaidSubscription: hasActiveSubscriptions,
			isEligible: true,
			variationName,
			isForcedVariation: true,
		};
	}

	const isLoading =
		isUserSettingsFetching ||
		! purchasesLoaded ||
		isUserPurchasesFetching ||
		( baseEligibility && isExperimentLoading );

	return {
		isLoading,
		isResurrectedSixMonths,
		hasActivePaidSubscription: hasActiveSubscriptions,
		isEligible: baseEligibility && experimentReady,
		variationName,
		isForcedVariation: false,
	};
}
