import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { NewUserResponse, UserResponse } from './types';

type FetchUserParams = {
	find_by_id?: boolean;
};

export const fetchUserProfile = (
	userIdOrLogin: string | number,
	params?: FetchUserParams
): Promise< UserResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/users/${ userIdOrLogin }`, params ?? {} ),
		apiVersion: '1.1',
		method: 'GET',
	} );
};

/**
 * Creates a WordPress.com account. The body varies by signup flow (passwordless,
 * social, etc.) and must include the signup client credentials.
 */
export const createUser = ( body: Record< string, unknown > ): Promise< NewUserResponse > => {
	return wpcom.req.post( { path: '/users/new', body } );
};
