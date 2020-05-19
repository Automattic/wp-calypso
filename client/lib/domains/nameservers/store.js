/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { initialDomainState, reducer } from './reducer';

const NameserversStore = createReducerStore( reducer );

NameserversStore.getByDomainName = function ( domainName ) {
	const state = this.get();

	return state[ domainName ] || initialDomainState;
};

export default NameserversStore;
