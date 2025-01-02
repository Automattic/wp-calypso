import { Action, Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import wpcom from 'calypso/lib/wp';
import { READER_USER_RECEIVE } from 'calypso/state/reader/action-types';
import type { AppState } from 'calypso/types';

import 'calypso/state/reader/init';

export interface ReaderUser {
	ID: number;
	display_name: string;
	username: string;
	avatar_URL: string;
	profile_URL: string;
	has_avatar: boolean;
}

const requestsInFlight = new Set< string >();

export function receiveUser( user: ReaderUser ) {
	return {
		type: READER_USER_RECEIVE,
		payload: user,
	};
}

export const fetchUser =
	( userId: string ): ThunkAction< Promise< ReaderUser >, AppState, void, Action > =>
	async ( dispatch: Dispatch ) => {
		if ( requestsInFlight.has( userId ) ) {
			return Promise.reject( new Error( 'Request already in flight' ) );
		}

		requestsInFlight.add( userId );

		try {
			const data = ( await wpcom.req.get(
				`/users/${ encodeURIComponent( userId ) }/`
			) ) as ReaderUser;
			requestsInFlight.delete( userId );
			const userData = {
				...data,
				has_avatar: Boolean( data.avatar_URL ),
			};
			dispatch( receiveUser( userData ) );
			return userData;
		} catch ( error ) {
			requestsInFlight.delete( userId );
			throw error;
		}
	};
