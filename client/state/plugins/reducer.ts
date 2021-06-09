/**
 * External dependencies
 */

import { withStorageKey } from '@automattic/state-utils';
import { DefaultRootState } from 'react-redux';

/**
 * Internal dependencies
 */
import { combineReducers } from 'calypso/state/utils';
import wporg from './wporg/reducer';
import premium from './premium/reducer';
import installed from './installed/reducer';
import upload from './upload/reducer';
import recommended from './recommended/reducer';
import marketplace from './marketplace/reducer';
import { IPurchaseFlowState } from './marketplace/types';

export interface IAppState extends DefaultRootState {
	plugins: IPluginsState;
}

export interface IPluginsState {
	wporg: any;
	premium: any;
	installed: any;
	upload: any;
	recommended: any;
	marketplace: { purchaseFlow: IPurchaseFlowState };
}

const combinedReducer = combineReducers( {
	wporg,
	premium,
	installed,
	upload,
	recommended,
	marketplace,
} );

export default withStorageKey( 'plugins', combinedReducer );
