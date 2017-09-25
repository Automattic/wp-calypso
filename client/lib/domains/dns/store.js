/**
 * Internal dependencies
 */
import { getInitialStateForDomain, reducer } from './reducer';
import { createReducerStore } from 'lib/store';

const DnsStore = createReducerStore( reducer );

DnsStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return ( state[ domainName ] || getInitialStateForDomain() );
};

export default DnsStore;
