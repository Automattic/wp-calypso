/**
 * External dependencies
 */
import { controls } from '@wordpress/data-controls';
import { plugins, registerStore, use } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as actions from './actions';
import * as selectors from './selectors';
import persistOptions from './persist';
import type { SelectFromMap, DispatchFromMap } from '@automattic/data-stores';

export type { State };
export { STORE_KEY };

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
		'isExperimental',
		'isImporting',
		'pageLayouts',
		'plan',
		'randomizedDesigns',
		'selectedDesign',
		'selectedFeatures',
		'selectedFonts',
		'selectedSite',
		'siteTitle',
		'siteVertical',
		'wasVerticalSkipped',
	],
} );

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
