/** @format */

/**
 * Internal dependencies
 */

import { createReducerStore } from 'client/lib/store';
import DomainsStore from 'client/lib/domains/store';
import { initialDomainState, reducer } from './reducer';

const WapiDomainInfoStore = createReducerStore( reducer, {}, [ DomainsStore.dispatchToken ] );

WapiDomainInfoStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return state[ domainName ] || initialDomainState;
};

export default WapiDomainInfoStore;
