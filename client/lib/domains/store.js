/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getForSite, initialState, reducer } from './reducer';

const DomainsStore = createReducerStore( reducer, initialState );

DomainsStore.getForSite = siteId => getForSite( DomainsStore.get(), siteId );

export default DomainsStore;
