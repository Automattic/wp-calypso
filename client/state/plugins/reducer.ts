import { withStorageKey } from '@automattic/state-utils';
import { combineReducers } from 'calypso/state/utils';
import installed from './installed/reducer';
import premium from './premium/reducer';
import recommended from './recommended/reducer';
import upload from './upload/reducer';
import wporg from './wporg/reducer';

export interface IPluginsState {
	wporg: any;
	premium: any;
	installed: any;
	upload: any;
	recommended: any;
}

const combinedReducer = combineReducers( {
	wporg,
	premium,
	installed,
	upload,
	recommended,
} );

export default withStorageKey( 'plugins', combinedReducer );
