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
			'domain',
			'domainSearch',
			'domainForm',
			'goals',
			'hasUsedPlansStep',
			'intent',
			'paidSubscribers',
			'selectedDesign',
			'selectedFeatures',
			'selectedSite',
			'siteTitle',
			'siteDescription',
			'siteLogo',
			'storeType',
			'verticalId',
			'storeLocationCountryCode',
			'ecommerceFlowRecurType',
			'couponCode',
			'domainCartItem',
			'planCartItem',
			'productCartItems',
		],
	} );
	isRegistered = true;
	return STORE_KEY;
}
