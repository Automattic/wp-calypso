import { wpcom } from './wpcom-request';

interface MediaUploadResponse {
	media?: [
		{
			ID: number;
			URL: string;
		},
	];
}

interface SiteSettingsResponse {
	id: number;
	url: string;
}

export async function uploadAndSetSiteLogo( siteId: string | number | undefined, file: File ) {
	const formData = [ [ 'media[]', file ] ];
	// first upload the image
	const uploadResult: MediaUploadResponse = await wpcom.req.post( {
		path: `/sites/${ encodeURIComponent( siteId as string ) }/media/new`,
		apiVersion: '1.1',
		formData,
	} );

	// then update the site settings to the uploaded image
	if ( uploadResult.media?.length ) {
		const imageID = uploadResult.media[ 0 ].ID;
		const logoResult: SiteSettingsResponse = await wpcom.req.post(
			{
				path: `/sites/${ encodeURIComponent( siteId as string ) }/settings`,
				apiVersion: 'v2',
				apiNamespace: 'wp/v2',
			},
			{ source: 'onboarding' },
			// we know the site doesn't have a logo nor an icon, let's set both
			{ site_logo: imageID, site_icon: imageID }
		);
		return { logoResult, uploadResult };
	}
	throw new Error( 'No image ID returned' );
}
