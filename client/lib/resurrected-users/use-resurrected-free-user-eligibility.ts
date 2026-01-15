import config from '@automattic/calypso-config';
import { useEffect, useMemo } from '@wordpress/element';
import { useExperiment } from 'calypso/lib/explat';
import { isRenewing, isSubscription } from 'calypso/lib/purchases';
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
	RESURRECTED_FREE_USERS_EXPERIMENT,
	RESURRECTION_DAY_LIMIT_EXPERIMENT,
	WELCOME_BACK_VARIATION_FLAG_MAP,
	type WelcomeBackVariation,
} from './constants';
import { hasExceededDormancyThreshold } from './utils';
import type { ExperimentAssignment } from '@automattic/explat-client';
import type { Purchase } from 'calypso/lib/purchases/types';

interface EligibilityResult {
	isLoading: boolean;
	isResurrectedSixMonths: boolean;
	hasActivePaidSubscription: boolean | null;
	isEligible: boolean;
	experimentAssignment: ExperimentAssignment | null;
	variationName: string | null;
	isForcedVariation: boolean;
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
	const variationName = ( experimentAssignment?.variationName ??
		null ) as WelcomeBackVariation | null;

	const forcedVariation =
		( Object.keys( WELCOME_BACK_VARIATION_FLAG_MAP ) as WelcomeBackVariation[] ).find(
			( candidate ) => config.isEnabled( WELCOME_BACK_VARIATION_FLAG_MAP[ candidate ] )
		) ?? null;

	if ( forcedVariation ) {
		return {
			isLoading: false,
			isResurrectedSixMonths,
			hasActivePaidSubscription: hasActiveSubscriptions,
			isEligible: true,
			experimentAssignment,
			variationName: forcedVariation,
			isForcedVariation: true,
		};
	}

	const isLoading =
		isUserSettingsFetching ||
		! purchasesLoaded ||
		isUserPurchasesFetching ||
		( baseEligibility && isExperimentLoading );

	const experimentReady = ! isExperimentLoading && !! variationName;

	return {
		isLoading,
		isResurrectedSixMonths,
		hasActivePaidSubscription: hasActiveSubscriptions,
		isEligible: baseEligibility && experimentReady,
		experimentAssignment,
		variationName,
		isForcedVariation: false,
	};
}
