import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadListItemsResponse, ReadListResponse, ReadSubscribedListsResponse } from './types';

export const fetchReadListItems = (
	userLogin: string,
	listName: string,
	meta: string,
	page: number = 1,
	number: number = 20
): Promise< ReadListItemsResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/read/lists/${ userLogin }/${ listName }/items`, {
			meta,
			page,
			number,
		} ),
		apiVersion: '1.2',
		method: 'GET',
	} );
};

export const fetchReadSubscribedLists = (): Promise< ReadSubscribedListsResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( '/read/lists', {
			create_recommended_blogs_list: 'true',
		} ),
		apiVersion: '1.2',
	} );
};

export const fetchReadList = ( owner: string, slug: string ): Promise< ReadListResponse > => {
	return wpcom.req.get( {
		path: `/read/lists/${ owner }/${ slug }`,
		apiVersion: '1.2',
	} );
};
