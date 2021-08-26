import { DefaultRootState } from 'react-redux';
import { IMarketplaceState } from 'calypso/state/marketplace/types';
import { IPluginsState } from 'calypso/state/plugins/reducer';

/**
 * This global app state is currently incomplete and should be completed as each state slice becomes typed
 * */
export interface IAppState extends DefaultRootState {
	plugins: IPluginsState;
	marketplace: IMarketplaceState;
}
