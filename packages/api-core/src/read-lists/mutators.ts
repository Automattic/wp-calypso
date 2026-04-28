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
		path: `/read/lists/${ list.owner }/${ list.slug }/update`,
		apiVersion: '1.2',
		body: list,
	} );
};
