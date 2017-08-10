/** @format */
/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getInitialStateForSite, reducer } from './reducer';

const SiteRedirectStore = createReducerStore( reducer );

SiteRedirectStore.getBySite = function( siteId ) {
	const state = this.get();

	if ( ! state[ siteId ] ) {
		return getInitialStateForSite();
	}

	return state[ siteId ];
};

export default SiteRedirectStore;
