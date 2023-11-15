import config from '@automattic/calypso-config';

export const postLoginRequest = async ( {
	twoStepWebauthnNonce,
	endpoint,
	data,
}: {
	twoStepWebauthnNonce?: string | false;
	endpoint: string;
	data: Record< string, string | number >;
} ) => {
	if ( ! twoStepWebauthnNonce ) {
		throw new Error( 'twoStepWebauthnNonce is required' );
	}
	const url = `https://wordpress.com/wp-login.php?action=${ endpoint }`;
	const formData = new window.FormData();
	const requestData = {
		...data,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		auth_type: 'webauthn',
		two_step_nonce: twoStepWebauthnNonce,
	};
	for ( const key in requestData ) {
		formData.set( key, requestData[ key ] );
	}

	const response = await window.fetch( url, {
		method: 'POST',
		body: formData,
		credentials: 'include',
	} );
	return response.json();
};
