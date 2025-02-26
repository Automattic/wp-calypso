import { registerStore } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import { registerPlugins } from '../plugins';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

export type { State };
export type OnboardSelect = SelectFromMap< typeof selectors >;
export type OnboardActions = DispatchFromMap< typeof actions >;

export { SiteGoal, SiteIntent } from './constants';
export * as utils from './utils';
export * from './types';
let isRegistered = false;

/**
 * Onboard store depends on site-store. You should register the site before using this store.
 */
export function register(): typeof STORE_KEY {
	if ( isRegistered ) {
		return STORE_KEY;
	}

	registerPlugins();

	registerStore( STORE_KEY, {
		actions,
		controls,
		reducer,
		selectors,
		persist: [
			'domainTransferNames',
			'shouldImportDomainTransferDnsRecords',
			'domain',
			'domainSearch',
			'domainForm',
			'goals',
			'hasUsedDomainsStep',
			'hasUsedPlansStep',
			'intent',
			'paidSubscribers',
			'lastLocation',
			'planProductId',
			'randomizedDesigns',
			'selectedDesign',
			'selectedStyleVariation',
			'selectedGlobalStyles',
			'selectedFeatures',
			'selectedSite',
			'readymadeTemplate',
			'siteTitle',
			'siteDescription',
			'siteLogo',
			'siteAccentColor',
			'storeType',
			'ecommerceFlowRecurType',
			'couponCode',
			'storageAddonSlug',
			'domainCartItem',
			'planCartItem',
			'productCartItems',
			'createWithBigSky',
		],
	} );
	isRegistered = true;
	return STORE_KEY;
}
