import wpcomRequest from 'wpcom-proxy-request';

export async function uploadAndSetSiteLogo( siteId: string | number | undefined, file: File ) {
	const formData = [ [ 'media[]', file ] ];
	// first upload the image
	const uploadResult = await wpcomRequest< {
		media?: [
			{
				ID: number;
				URL: string;
			},
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
			apiVersion: 'v2',
			apiNamespace: 'wp/v2',
			// we know the site doesn't have a logo nor an icon, let's set both
			body: { site_logo: imageID, site_icon: imageID },
			query: 'source=onboarding',
			method: 'POST',
		} );
		return { logoResult, uploadResult };
	}
	throw new Error( 'No image ID returned' );
}
