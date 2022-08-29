import { useMutation } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

export function useSiteLogoMutation( siteId: string | number | undefined ) {
	return useMutation( async ( file: File ) => {
		const formData = [ [ 'media[]', file ] ];
		// first upload the image
		const uploadResult = await wpcomRequest< {
			media?: [
				{
					ID: number;
					URL: string;
				}
			];
		} >( {
			path: `/sites/${ encodeURIComponent( siteId as string ) }/media/new`,
			apiVersion: '1.1',
			formData,
			method: 'POST',
		} );
		// then update the site settings to the uploaded image
		if ( uploadResult.media?.length ) {
			const imageID = uploadResult.media[ 0 ].ID;
			const logoResult = await wpcomRequest< {
				id: number;
				url: string;
			} >( {
				path: `/sites/${ encodeURIComponent( siteId as string ) }/settings`,
				apiVersion: '1.4',
				apiNamespace: 'rest/v1.4',
				body: { site_icon: imageID },
				method: 'POST',
			} );

			return { logoResult, uploadResult };
		}
		throw new Error( 'No image ID returned' );
	} );
}
