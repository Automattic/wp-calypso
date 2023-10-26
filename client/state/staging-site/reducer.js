import { withStorageKey } from '@automattic/state-utils';
import { SITE_STAGING_STATUS_SET as SET_STATUS } from 'calypso/state/action-types';
import {
	combineReducers,
	keyedReducer,
	withSchemaValidation,
	withPersistence,
} from 'calypso/state/utils';
import { StagingSiteStatus } from './constants';
import { stagingSite as schema } from './schema';

export const status = withPersistence( ( state = StagingSiteStatus.UNSET, action ) => {
	switch ( action.type ) {
		case SET_STATUS:
			return action.status || StagingSiteStatus.UNSET;
		default:
			return state;
	}
} );

export const siteReducer = combineReducers( {
	status,
} );

// state is a map of transfer sub-states
// keyed by the associated site id
const validatedReducer = withSchemaValidation( schema, keyedReducer( 'siteId', siteReducer ) );

const stagingSiteReducer = withStorageKey( 'stagingSite', validatedReducer );

export default stagingSiteReducer;
