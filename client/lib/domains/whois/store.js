/** @format */
/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { initialDomainState, reducer } from './reducer';

const WhoisStore = createReducerStore( reducer );

WhoisStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return state[ domainName ] || initialDomainState;
};

export default WhoisStore;
