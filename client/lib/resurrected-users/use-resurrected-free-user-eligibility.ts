import {
	RESURRECTED_FREE_USERS_EXPERIMENT,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
	WELCOME_BACK_VARIATION_FLAG_MAP,
	type WelcomeBackVariation,
} from './constants';
import { hasExceededDormancyThreshold } from './utils';
import config from '@automattic/calypso-config';
import type { ExperimentAssignment } from '@automattic/explat-client';
import { useEffect, useMemo } from '@wordpress/element';
import { useExperiment } from 'calypso/lib/explat';
import { isRenewing, isSubscription } from 'calypso/lib/purchases';
import type { Purchase } from 'calypso/lib/purchases/types';
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

interface EligibilityResult {
	isLoading: boolean;
	isResurrectedSixMonths: boolean;
	hasActivePaidSubscription: boolean | null;
	isEligible: boolean;
	experimentAssignment: ExperimentAssignment | null;
	variationName: string | null;
}

function hasActivePaidSubscription( purchases: Purchase[] | null ): boolean | null {
	if ( purchases === null ) {
		return null;
	}

	return purchases.some( ( purchase ) => isSubscription( purchase ) && isRenewing( purchase ) );
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

	const lastSeen = userSettings?.last_admin_activity_timestamp;
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
	const variationName = experimentAssignment?.variationName as WelcomeBackVariation | null;
	const variationFlagName = variationName ? WELCOME_BACK_VARIATION_FLAG_MAP[ variationName ] : null;
	const isVariantFlagEnabled = variationFlagName ? config.isEnabled( variationFlagName ) : true;

	const isLoading =
		isUserSettingsFetching ||
		! purchasesLoaded ||
		isUserPurchasesFetching ||
		( baseEligibility && isExperimentLoading );

	const experimentReady = ! isExperimentLoading && !! variationName && isVariantFlagEnabled;

	return {
		isLoading,
		isResurrectedSixMonths,
		hasActivePaidSubscription: hasActiveSubscriptions,
		isEligible: baseEligibility && experimentReady,
		experimentAssignment,
		variationName,
	};
}
