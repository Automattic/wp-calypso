/** @format */
/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { initialDomainState, reducer } from './reducer';

const EmailForwardingStore = createReducerStore( reducer );

EmailForwardingStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return state[ domainName ] || initialDomainState;
};

export default EmailForwardingStore;
