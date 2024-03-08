/**
 * External dependencies
 */
import wpcomLimitedRequest from './wpcom-limited-request';
/**
 * Types
 */
import type { SaveToMediaLibraryProps, SaveToMediaLibraryResponseProps } from '../../types';

export async function saveToMediaLibrary( { siteId, url, attrs = {} }: SaveToMediaLibraryProps ) {
	const body = {
		media_urls: [ url ],
		attrs: [ attrs ],
	};

	const response = await wpcomLimitedRequest< SaveToMediaLibraryResponseProps >( {
		path: `/sites/${ String( siteId ) }/media/new`,
		apiVersion: '1.1',
		body,
		method: 'POST',
	} );

	return response.media[ 0 ];
}
