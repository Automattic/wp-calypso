import { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'calypso/state';
import isActivatingJetpackModule from 'calypso/state/selectors/is-activating-jetpack-module';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isJetpackSite } from 'calypso/state/sites/selectors';

export default function useSubscriptionBanner( siteId?: number, isDismissed?: boolean ) {
	const isJetpack = useSelector( ( state ) => isJetpackSite( state, siteId ) );
	const isSubscriptionsModuleActive = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}
		return isJetpackModuleActive( state, siteId, 'subscriptions' );
	} );
	const isSubscriptionsModuleActivating = useSelector( ( state ) => {
		if ( ! siteId ) {
			return null;
		}
		return isActivatingJetpackModule( state, siteId, 'subscriptions' );
	} );

	const [ showSubscriptionBanner, setShowSubscriptionBanner ] = useState( false );

	const shouldShowSubscriptionBanner = useCallback(
		() =>
			!! isJetpack &&
			! isDismissed &&
			! isSubscriptionsModuleActivating &&
			isSubscriptionsModuleActive === false,
		[ isJetpack, isDismissed, isSubscriptionsModuleActive, isSubscriptionsModuleActivating ]
	);

	useEffect(
		() => setShowSubscriptionBanner( shouldShowSubscriptionBanner() ),
		[ shouldShowSubscriptionBanner ]
	);

	return showSubscriptionBanner;
}
