/** @format */
/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { getBySite, initialState, reducer } from './reducer';

const DomainsStore = createReducerStore( reducer, initialState );

DomainsStore.getBySite = siteId => getBySite( DomainsStore.get(), siteId );

export default DomainsStore;
