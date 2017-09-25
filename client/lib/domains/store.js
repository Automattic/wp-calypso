/**
 * Internal dependencies
 */
import { getBySite, initialState, reducer } from './reducer';
import { createReducerStore } from 'lib/store';

const DomainsStore = createReducerStore( reducer, initialState );

DomainsStore.getBySite = siteId => getBySite( DomainsStore.get(), siteId );

export default DomainsStore;
