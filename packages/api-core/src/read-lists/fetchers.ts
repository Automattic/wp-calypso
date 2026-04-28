import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type {
	ReadListItemsResponse,
	ReadListResponse,
	ReadSubscribedListsResponse,
	ReadUserListsResponse,
} from './types';

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
		path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent( slug ) }`,
		apiVersion: '1.2',
	} );
};

export const fetchReadUserLists = ( userLogin: string ): Promise< ReadUserListsResponse > => {
	return wpcom.req.get( {
		path: `/read/lists/${ encodeURIComponent( userLogin ) }`,
		apiVersion: '1',
	} );
};
