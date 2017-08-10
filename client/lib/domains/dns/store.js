/** @format */
/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getInitialStateForDomain, reducer } from './reducer';

const DnsStore = createReducerStore( reducer );

DnsStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return state[ domainName ] || getInitialStateForDomain();
};

export default DnsStore;
