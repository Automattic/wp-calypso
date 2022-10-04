import { plugins, registerStore, use } from '@wordpress/data';
import { controls } from '@wordpress/data-controls';
import persistOptions from '../one-week-persistence-config';
import * as actions from './actions';
import { STORE_KEY } from './constants';
import reducer, { State } from './reducer';
import * as selectors from './selectors';
import type { SelectFromMap, DispatchFromMap } from '../mapped-types';

export type { State };
export type { LaunchStepType } from './types';
export { STORE_KEY };

use( plugins.persistence, persistOptions );

let isRegistered = false;

export function register(): typeof STORE_KEY {
	if ( ! isRegistered ) {
		isRegistered = true;
		registerStore< State >( STORE_KEY, {
			actions,
			controls,
			reducer,
			selectors,
			persist: [
				'domain',
				'domainSearch',
				'planProductId',
				'planBillingPeriod',
				'confirmedDomainSelection',
				'isAnchorFm',
				'isSiteTitleStepVisible',
				'siteTitle',
			],
		} );
	}
	return STORE_KEY;
}

declare module '@wordpress/data' {
	function dispatch( key: typeof STORE_KEY ): DispatchFromMap< typeof actions >;
	function select( key: typeof STORE_KEY ): SelectFromMap< typeof selectors >;
}
