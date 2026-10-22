import { wpcom } from '../wpcom-fetcher';
import type { ReadSavedPostParams, ReadSavedPostResponse } from './types';

// Both writes are POSTs, like `/seen-posts/seen/new|delete`: `wpcom.req` can't
// send a body with DELETE.
function post( path: string, { key, source }: ReadSavedPostParams ) {
	return wpcom.req.post( {
		path,
		apiNamespace: 'wpcom/v2',
		body: { ...key, source },
	} );
}

export const saveReadPost = ( params: ReadSavedPostParams ): Promise< ReadSavedPostResponse > =>
	post( '/read/saved/new', params );

export const unsaveReadPost = ( params: ReadSavedPostParams ): Promise< ReadSavedPostResponse > =>
	post( '/read/saved/delete', params );
