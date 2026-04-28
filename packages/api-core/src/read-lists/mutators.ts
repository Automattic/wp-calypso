import { wpcom } from '../wpcom-fetcher';
import type { CreateReadListParams, ReadListResponse, UpdateReadListParams } from './types';

export const createReadList = ( params: CreateReadListParams ): Promise< ReadListResponse > => {
	return wpcom.req.post( {
		path: '/read/lists/new',
		apiVersion: '1.2',
		body: params,
	} );
};

export const updateReadList = ( list: UpdateReadListParams ): Promise< ReadListResponse > => {
	return wpcom.req.post( {
		path: `/read/lists/${ encodeURIComponent( list.owner ) }/${ encodeURIComponent(
			list.slug
		) }/update`,
		apiVersion: '1.2',
		body: list,
	} );
};

export const followReadList = ( owner: string, slug: string ): Promise< ReadListResponse > => {
	return wpcom.req.post( {
		path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent( slug ) }/follow`,
		apiVersion: '1.2',
		body: {},
	} );
};

export const unfollowReadList = ( owner: string, slug: string ): Promise< ReadListResponse > => {
	return wpcom.req.post( {
		path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent( slug ) }/unfollow`,
		apiVersion: '1.2',
		body: {},
	} );
};

export const deleteReadList = ( owner: string, slug: string ): Promise< void > => {
	return wpcom.req.post( {
		path: `/read/lists/${ encodeURIComponent( owner ) }/${ encodeURIComponent( slug ) }/delete`,
		apiVersion: '1.2',
		body: {},
	} );
};
