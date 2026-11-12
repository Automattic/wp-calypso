const callbackPath = /^(\/sites\/[a-z\d.-]+\/migration-overview\/share-access)\/authorize\/?$/i;

export default function migrationAuthorization( req, res, next ) {
	const path = callbackPath.exec( req.path )?.[ 1 ];
	if ( ! path ) {
		return next();
	}

	const { state, user_login: username, password, success } = req.query;
	let destination = path;
	if ( typeof state === 'string' && /^[a-f\d-]{36}$/.test( state ) ) {
		const fragment = new URLSearchParams( { 'migration-authorization': state } );
		if ( typeof username === 'string' && typeof password === 'string' ) {
			fragment.set( 'user_login', username );
			fragment.set( 'password', password );
			destination += `#${ fragment }`;
		} else if ( success === 'false' ) {
			fragment.set( 'success', 'false' );
			destination += `#${ fragment }`;
		}
	}

	res.set( {
		'Cache-Control': 'no-store',
		'Referrer-Policy': 'no-referrer',
		Location: destination,
	} );
	res.status( 303 ).end();
}
