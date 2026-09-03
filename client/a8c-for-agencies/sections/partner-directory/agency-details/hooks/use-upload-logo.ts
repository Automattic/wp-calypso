import wpcom from 'calypso/lib/wp';

interface UploadLogoResponse {
	asset_type: string;
	attachment_id: number;
	url: string;
	mime: string;
	width: number;
	height: number;
}

export const useUploadLogo =
	() =>
	async ( agencyId: number | undefined, file: File ): Promise< UploadLogoResponse | undefined > => {
		if ( agencyId === undefined ) {
			return;
		}

		const formData = new FormData();
		formData.append( 'media', file );
		formData.append( 'asset_type', 'partner_directory_logo' );

		return await wpcom.req.post( {
			apiNamespace: 'wpcom/v2',
			path: '/agency/' + agencyId + '/media',
			body: formData,
		} );
	};
