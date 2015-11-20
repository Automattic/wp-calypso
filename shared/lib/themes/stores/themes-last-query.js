/**
 * Internal dependencies
 */
import { createReducerStore } from 'lib/store';
import { reducer, initialState } from '../reducers/themes-last-query';

const LastQueryStore = createReducerStore( reducer, initialState );

LastQueryStore.getSiteId = () => LastQueryStore.get().get( 'currentSiteId' );
LastQueryStore.hasSiteChanged = () => {
	const previousSiteId = LastQueryStore.get().get( 'previousSiteId' );
	return previousSiteId !== LastQueryStore.getSiteId();
};
LastQueryStore.hasParams = () => !! LastQueryStore.get().get( 'lastParams' );
LastQueryStore.getParams = () => LastQueryStore.get().get( 'lastParams' ) || {};
LastQueryStore.isJetpack = () => LastQueryStore.get().get( 'isJetpack' );

export default LastQueryStore;
