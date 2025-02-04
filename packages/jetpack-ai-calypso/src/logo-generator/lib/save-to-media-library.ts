/**
 * Internal dependencies
 */
import wpcomLimitedRequest from './wpcom-limited-request';
/**
 * Types
 */
import type { SaveToMediaLibraryProps, SaveToMediaLibraryResponseProps } from '../../types';

export async function saveToMediaLibrary( {
	siteId,
	url,
	logo = { url: '', description: '' },
	attrs = {},
}: SaveToMediaLibraryProps ) {
	// if the logo has a URL and it's a base64 string, use formData as expected by the API
	if ( logo.url && logo.url.includes( 'data:image/png;base64,' ) ) {
		// new FLUX response should send the logo object with a b64_json string
		const fileResponse = await fetch( logo.url );
		const blob = await fileResponse.blob();
		const file = new File( [ blob ], 'site-logo.png', { type: 'image/png' } );

		const formData: ( string | File )[][] = [
			[ 'media[]', file ],
			[ 'attrs[]', JSON.stringify( attrs ) ],
		];

		const response = await wpcomLimitedRequest< SaveToMediaLibraryResponseProps >( {
			path: `/sites/${ String( siteId ) }/media/new`,
			apiVersion: '1.1',
			method: 'POST',
			formData,
		} );
		return response.media[ 0 ];
	}

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
