import { addQueryArgs } from '@wordpress/url';
import { wpcom } from '../wpcom-fetcher';
import type { ReadSingleTagResponse, ReadTagsResponse } from './types';

export const fetchReadTags = ( locale?: string | null ): Promise< ReadTagsResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( '/read/tags', { locale: locale ?? undefined } ),
		apiVersion: '1.2',
	} );
};

export const fetchReadTag = (
	slug: string,
	locale?: string | null
): Promise< ReadSingleTagResponse > => {
	return wpcom.req.get( {
		path: addQueryArgs( `/read/tags/${ encodeURIComponent( slug ) }`, {
			locale: locale ?? undefined,
		} ),
		apiVersion: '1.2',
	} );
};
