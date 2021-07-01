/**
 * External dependencies
 */
import { DefaultRootState } from 'react-redux';

/**
 * Internal dependencies
 */
import { IPluginsState } from 'calypso/state/plugins/reducer';
import { IMarketplaceState } from 'calypso/state/marketplace/types';

export interface IAppState extends DefaultRootState {
	plugins: IPluginsState;
	marketplace: IMarketplaceState;
}
