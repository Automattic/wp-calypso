/**
 * Internal dependencies
 */
import { getInitialStateForSite, reducer } from './reducer';
import { createReducerStore } from 'lib/store';

const SiteRedirectStore = createReducerStore( reducer );

SiteRedirectStore.getBySite = function( siteId ) {
	const state = this.get();

	if ( ! state[ siteId ] ) {
		return getInitialStateForSite();
	}

	return state[ siteId ];
};

export default SiteRedirectStore;
