import { plugins, registerStore, use } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import persistOptions from './persist';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap, DispatchFromMap } from '@automattic/data-stores';

export type { State };

/**
 * Onboard store depends on site-store. This variable is to keep track of it.
 */
export let siteStoreKey: string;

/**
 * Onboard store depends on site-store. You should register the site store and pass it's key here
 */
export function register( registeredSiteStoreKey: string ): typeof STORE_KEY {
	siteStoreKey = registeredSiteStoreKey;
	use( plugins.persistence, persistOptions );

	registerStore< State >( STORE_KEY, {
		actions,
		controls,
		reducer: reducer as any, // eslint-disable-line @typescript-eslint/no-explicit-any
		selectors,
		persist: [
			'domain',
			'domainSearch',
			'hasUsedDomainsStep',
			'hasUsedPlansStep',
			'lastLocation',
			'planProductId',
			'randomizedDesigns',
			'selectedDesign',
			'selectedFeatures',
			'selectedFonts',
			'selectedSite',
			'siteTitle',
		],
	} );

	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
