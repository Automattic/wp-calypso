import { wpcom } from '../wpcom-fetcher';
import type { ReadTag } from './types';

export interface FollowReadTagResponse {
	subscribed: boolean;
	added_tag: string;
	tags: ReadTag[];
}

export interface UnfollowReadTagResponse {
	subscribed: boolean;
	removed_tag: string;
}

export const followReadTag = ( slug: string ): Promise< FollowReadTagResponse > => {
	return wpcom.req.post( {
		path: `/read/tags/${ encodeURIComponent( slug ) }/mine/new`,
		apiVersion: '1.1',
	} );
};

export const unfollowReadTag = ( slug: string ): Promise< UnfollowReadTagResponse > => {
	return wpcom.req.post( {
		path: `/read/tags/${ encodeURIComponent( slug ) }/mine/delete`,
		apiVersion: '1.1',
	} );
};
