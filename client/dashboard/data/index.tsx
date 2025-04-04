import wpcom from 'calypso/lib/wp';

export const fetchProfile = () =>
	wpcom.req.get( {
		path: '/me?http_envelope=1',
		apiNamespace: 'rest/v1.1',
	} );
