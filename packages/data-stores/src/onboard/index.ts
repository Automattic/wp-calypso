import { plugins, registerStore, use } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import persistOptions from '../one-week-persistence-config';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

export type { State };

export { SiteGoal, SiteIntent } from './constants';
export * as utils from './utils';
let isRegistered = false;

/**
 * Onboard store depends on site-store. You should register the site before using this store.
 */
export function register(): typeof STORE_KEY {
	if ( isRegistered ) {
		return STORE_KEY;
	}
	use( plugins.persistence, persistOptions );

	registerStore< State >( STORE_KEY, {
		actions,
		controls,
		reducer: reducer as any, // eslint-disable-line @typescript-eslint/no-explicit-any
		selectors,
		persist: [
			'anchorPodcastId',
			'anchorEpisodeId',
			'anchorSpotifyUrl',
			'domain',
			'domainSearch',
			'goals',
			'hasUsedDomainsStep',
			'hasUsedPlansStep',
			'intent',
			'lastLocation',
			'planProductId',
			'randomizedDesigns',
			'selectedDesign',
			'selectedFeatures',
			'selectedFonts',
			'selectedSite',
			'siteTitle',
			'patternContent',
			'siteDescription',
			'siteLogo',
			'siteAccentColor',
			'storeType',
		],
	} );
	isRegistered = true;
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
