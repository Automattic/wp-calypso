/**
 * Internal dependencies
 */
import { initialDomainState, reducer } from './reducer';
import DomainsStore from 'lib/domains/store';
import { createReducerStore } from 'lib/store';

const WapiDomainInfoStore = createReducerStore( reducer, {}, [ DomainsStore.dispatchToken ] );

WapiDomainInfoStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return ( state[ domainName ] || initialDomainState );
};

export default WapiDomainInfoStore;
