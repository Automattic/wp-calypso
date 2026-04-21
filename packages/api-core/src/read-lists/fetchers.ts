import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadListItemsResponse } from './types';

export const fetchReadListItems = (
	userLogin: string,
	listName: string
): Promise< ReadListItemsResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/read/lists/${ userLogin }/${ listName }/items`, {
			meta: 'feed,site', // Include feed and site data in the response for each list item.
			number: 200, // Fetch up to 200 items to minimize the number of requests needed for larger lists.
		} ),
		apiVersion: '1.2',
		method: 'GET',
	} );
};
