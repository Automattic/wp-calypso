import type { IMarketplaceState } from 'calypso/state/marketplace/types';
import type { IPluginsState } from 'calypso/state/plugins/reducer';
import type { StoredCardsState } from 'calypso/state/stored-cards/types';
import type { DefaultRootState } from 'react-redux';
import type { AnyAction } from 'redux';
import type { ThunkDispatch } from 'redux-thunk';

/**
 * This global app state is currently incomplete and should be completed as each state slice becomes typed
 */
export interface IAppState extends DefaultRootState {
	plugins: IPluginsState;
	marketplace: IMarketplaceState;
	storedCards: StoredCardsState;
}

/**
 * Type of the Calypso Redux store `dispatch` function. Accepts both plain actions and thunks.
 */
export type CalypsoDispatch = ThunkDispatch< unknown, void, AnyAction >;
