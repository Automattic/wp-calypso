import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteLogoMutation( siteId: string | number | undefined ) {
	return useMutation( async ( file: File ) => {
		const formData = [ [ 'media[]', file ] ];
		// first upload the image
		const response = await wpcomRequest< {
			media?: [
				{
					ID: number;
				}
			];
		} >( {
			path: `/sites/${ encodeURIComponent( siteId as string ) }/media/new`,
			apiVersion: '1.1',
			formData,
			method: 'POST',
		} );
		// then update the site settings to the uploaded image
		if ( response.media?.length ) {
			const imageID = response.media[ 0 ].ID;
			return await wpcomRequest< {
				id: 12345;
				url: string;
			} >( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/settings`,
				apiVersion: '1.4',
				apiNamespace: 'rest/v1.4',
				body: { site_icon: imageID },
				method: 'POST',
			} );
		}
		throw new Error( 'No image ID returned' );
	} );
}
