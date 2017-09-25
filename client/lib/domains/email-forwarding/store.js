/**
 * Internal dependencies
 */
import { initialDomainState, reducer } from './reducer';
import { createReducerStore } from 'lib/store';

const EmailForwardingStore = createReducerStore( reducer );

EmailForwardingStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return ( state[ domainName ] || initialDomainState );
};

export default EmailForwardingStore;
