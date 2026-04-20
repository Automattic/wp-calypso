import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { GetReaderUserResponse } from './types';

interface GetReaderUserParams {
	find_by_id?: boolean;
}

export const fetchReaderUser = (
	userIdOrLogin: string | number,
	params?: GetReaderUserParams
): Promise< GetReaderUserResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/users/${ userIdOrLogin }`, params ?? {} ),
		apiVersion: '1.1',
		method: 'GET',
	} );
};
