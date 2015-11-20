/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getInitialStateForDomain, reducer } from './reducer';

const GoogleAppsUsersStore = createReducerStore( reducer );

GoogleAppsUsersStore.getByDomainName = function( domainName ) {
	const state = this.get();

	if ( ! state[ domainName ] ) {
		return getInitialStateForDomain();
	}

	return state[ domainName ];
};

export default GoogleAppsUsersStore;
