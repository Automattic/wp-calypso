/**
 * Internal dependencies
 */
import { rewindSetCredentialsSchema } from './schema';
import {
	REWIND_SET_CREDENTIALS_SUCCESS,
	REWIND_SET_CREDENTIALS_FAILURE,
	REWIND_SET_CREDENTIALS,
} from 'state/action-types';
import {
	createReducer,
	keyedReducer,
} from 'state/utils';

const stubNull = () => null;

export const rewindSetCredentials = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_SET_CREDENTIALS_FAILURE ]: stubNull,
	[ REWIND_SET_CREDENTIALS ]: ( state, { status } ) => status,
	[ REWIND_SET_CREDENTIALS_SUCCESS ]: ( state ) => ( {
		...state,
		credentialsUpdated: true,
	} ),
} ) );
rewindSetCredentials.schema = rewindSetCredentialsSchema;

export const rewindSetCredentialsError = keyedReducer( 'siteId', createReducer( {}, {
	[ REWIND_SET_CREDENTIALS_FAILURE ]: ( state, { error } ) => error,
	[ REWIND_SET_CREDENTIALS ]: stubNull,
} ) );
