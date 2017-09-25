/**
 * Internal dependencies
 */
import { initialDomainState, reducer } from './reducer';
import { createReducerStore } from 'lib/store';

const WhoisStore = createReducerStore( reducer );

WhoisStore.getByDomainName = function( domainName ) {
	const state = this.get();

	return ( state[ domainName ] || initialDomainState );
};

export default WhoisStore;
