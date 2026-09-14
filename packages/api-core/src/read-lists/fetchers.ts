import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadListResponse, ReadSubscribedListsResponse, ReadUserListsResponse } from './types';

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
