export const getRedirectUri = () => {
	const host = typeof window !== 'undefined' && window.location.host;

	let protocol = 'https';
	if ( typeof window !== 'undefined' && window.location.hostname === 'calypso.localhost' ) {
		protocol = 'http';
	}

	return `${ protocol }://${ host }/start/user`;
};

export const getSocialServiceResponse = () => {
	const hash = window.location.hash.substring( 1 );
	const params = new URLSearchParams( hash );
	const clientId = params.get( 'client_id' );

	if ( ! clientId ) {
		return null;
	}

	return {
		client_id: clientId,
		state: params.get( 'state' ) ?? '',
		user_email: params.get( 'user_email' ) ?? '',
		user_name: params.get( 'user_name' ) ?? '',
		id_token: params.get( 'id_token' ) ?? '',
	};
};
