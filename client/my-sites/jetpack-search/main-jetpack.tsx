import { ReactElement } from 'react';
import { useSelector } from 'react-redux';
import {
	getSitePurchases,
	hasLoadedUserPurchasesFromServer,
	isFetchingUserPurchases,
} from 'calypso/state/purchases/selectors';
import getJetpackModules from 'calypso/state/selectors/get-jetpack-modules';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { getSite } from 'calypso/state/sites/selectors';
import JetpackSearchDetails from './details';
import JetpackSearchDisconnected from './disconnected';
import JetpackSearchPlaceholder from './placeholder';
import { hasJetpackSearchPurchaseOrPlan } from './purchases';
import JetpackSearchUpsell from './upsell';

interface Props {
	siteId: number;
}

export default function JetpackSearchMainJetpack( { siteId }: Props ): ReactElement {
	const site = useSelector( ( state ) => getSite( state, siteId ) );
	const sitePurchases = useSelector( ( state ) => getSitePurchases( state, siteId ) );
	const hasSearchProduct = hasJetpackSearchPurchaseOrPlan(
		sitePurchases,
		site?.plan?.product_slug
	);
	const isFetchingPurchases = useSelector( isFetchingUserPurchases );
	const hasLoadedPurchases = useSelector( hasLoadedUserPurchasesFromServer );
	const isRequestingPurchases =
		! hasLoadedPurchases || isFetchingPurchases || ! Array.isArray( sitePurchases );

	// Have we loaded the necessary purchases and modules? If not, show the placeholder.
	const modules = useSelector( ( state ) => getJetpackModules( state, siteId ) );

	const isRequestingModules = useSelector( ( state ) => isFetchingJetpackModules( state, siteId ) );

	// On Jetpack sites, we need to check if the search module is active, rather than checking settings.
	const isJetpackSearchModuleActive = useSelector( ( state ) =>
		isJetpackModuleActive( state, siteId, 'search' )
	);

	// isRequestingModules is null if a request hasn't been triggered yet
	const isLoading = isRequestingPurchases || isRequestingModules || isRequestingModules === null;

	if ( isLoading ) {
		return <JetpackSearchPlaceholder siteId={ siteId } isJetpack={ true } />;
	}

	if ( ! hasSearchProduct ) {
		return <JetpackSearchUpsell />;
	}

	if ( ! isLoading && modules === null ) {
		return <JetpackSearchDisconnected />;
	}

	return <JetpackSearchDetails isSearchEnabled={ isJetpackSearchModuleActive } />;
}
