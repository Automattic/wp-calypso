/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState, hasSiteChanged, hasParams } from '../reducers/themes-last-query';

const LastQueryStore = createReducerStore( reducer, initialState );

LastQueryStore.getSiteId = () => LastQueryStore.get().get( 'currentSiteId' );
LastQueryStore.hasSiteChanged = () => hasSiteChanged( LastQueryStore.get() );
LastQueryStore.hasParams = () => hasParams( LastQueryStore.get() );
LastQueryStore.getParams = () => LastQueryStore.get().get( 'lastParams' ) || {};
LastQueryStore.isJetpack = () => LastQueryStore.get().get( 'isJetpack' );

export default LastQueryStore;
