/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer } from './reducer'

const DnsStore = createReducerStore( reducer );

DnsStore.getByDomainName = function( domainName ) {
	const state = this.get();

	if ( ! state || ! state[ domainName ] ) {
		return null;
	}

	return state[ domainName ];
};

export default DnsStore;
