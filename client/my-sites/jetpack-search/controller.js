import { isJetpackSearchSlug } from '@automattic/calypso-products';
import Debug from 'debug';
import QueryJetpackModules from 'calypso/components/data/query-jetpack-modules';
import QuerySiteSettings from 'calypso/components/data/query-site-settings';
import IsJetpackDisconnectedSwitch from 'calypso/components/jetpack/is-jetpack-disconnected-switch';
import { UpsellProductCardPlaceholder } from 'calypso/components/jetpack/upsell-product-card';
import UpsellSwitch from 'calypso/components/jetpack/upsell-switch';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import getSiteSetting from 'calypso/state/selectors/get-site-setting';
import isFetchingJetpackModules from 'calypso/state/selectors/is-fetching-jetpack-modules';
import isJetpackModuleActive from 'calypso/state/selectors/is-jetpack-module-active';
import { isRequestingSiteSettings } from 'calypso/state/site-settings/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import JetpackSearchDisconnected from './disconnected';
import JetpackSearchUpsell from './jetpack-search-upsell';
import SearchMain from './main';
import WPComSearchPlaceholder from './placeholder';

const debug = new Debug( 'calypso:my-sites:search:controller' );

export function showUpsellIfNoSearch( context, next ) {
	debug( 'controller: showUpsellIfNoSearch', context.params );

	const state = context.store.getState();
	const siteId = getSelectedSiteId( state );
	const isJetpack = isJetpackSite( state, siteId );

	// On Jetpack sites, we need to check if the search module is active, on WPCom sites we
	// check 'jetpack_search_enabled' in the site settings.
	const QueryComponent = isJetpack ? QueryJetpackModules : QuerySiteSettings;
	const getSearchState = isJetpack ? getJetpackSearchState : getWPComSearchState;
	const isRequestingForSite = isJetpack ? isFetchingJetpackModules : isRequestingSiteSettings;
	const UpsellPlaceholder = isJetpackCloud()
		? UpsellProductCardPlaceholder
		: WPComSearchPlaceholder;

	context.primary = (
		<>
			<UpsellSwitch
				UpsellComponent={ JetpackSearchUpsell }
				QueryComponent={ QueryComponent }
				getStateForSite={ getSearchState }
				isRequestingForSite={ isRequestingForSite }
				display={ context.primary }
				productSlugTest={ isJetpackSearchSlug }
			>
				<UpsellPlaceholder />
			</UpsellSwitch>
		</>
	);

	next();
}

export function showJetpackIsDisconnected( context, next ) {
	debug( 'controller: showJetpackIsDisconnected', context.params );
	context.primary = (
		<IsJetpackDisconnectedSwitch
			trueComponent={ <JetpackSearchDisconnected /> }
			falseComponent={ context.primary }
		/>
	);
	next();
}

/* handles /jetpack-search/:site, see `jetpackSearchMainPath` */
export function jetpackSearchMain( context, next ) {
	debug( 'controller: jetpackSearchMain', context.params );

	context.primary = <SearchMain />;
	next();
}

// Selectors used for the Search UpsellSwitch (above)
function getJetpackSearchState( state, siteId ) {
	const isSearchModuleActive = isJetpackModuleActive( state, siteId, 'search' );
	return {
		state: isSearchModuleActive ? 'active' : 'unavailable',
		...( ! isSearchModuleActive && { reason: 'search_not_active' } ),
	};
}

function getWPComSearchState( state, siteId ) {
	const isSearchSettingEnabled = getSiteSetting( state, siteId, 'jetpack_search_enabled' );
	return {
		state: isSearchSettingEnabled ? 'active' : 'unavailable',
		...( ! isSearchSettingEnabled && { reason: 'search_not_active' } ),
	};
}
