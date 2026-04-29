import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadListItemsResponse } from './types';

export const fetchReadListItems = (
	userLogin: string,
	listName: string,
	meta: string,
	page: number = 1,
	number: number = 20
): Promise< ReadListItemsResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs(
			`/read/lists/${ encodeURIComponent( userLogin ) }/${ encodeURIComponent( listName ) }/items`,
			{
				meta,
				page,
				number,
			}
		),
		apiVersion: '1.2',
		method: 'GET',
	} );
};
