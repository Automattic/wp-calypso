import wpcom from 'calypso/lib/wp';

export const useUploadLogo = () => async ( agencyId: number | undefined, file: File ) => {
	if ( agencyId === undefined ) {
		return;
	}

	const formData = new FormData();
	formData.append( 'media', file );

	return await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: '/agency/' + agencyId + '/profile/logo',
		body: formData,
	} );
};
