import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadListItemsResponse } from './types';

export const fetchReadListItems = (
	userLogin: string,
	listName: string,
	page: number = 1,
	number: number = 20
): Promise< ReadListItemsResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/read/lists/${ userLogin }/${ listName }/items`, {
			meta: 'feed,site', // Include feed and site data in the response for each list item.
			number,
			page,
		} ),
		apiVersion: '1.2',
		method: 'GET',
	} );
};
