import wpcom from 'calypso/lib/wp';

class ValidationError extends Error {
	constructor( code ) {
		super( code );
		this.code = code;
	}
}

export function canRedirect( siteId, domainName, onComplete ) {
	if ( ! domainName ) {
		onComplete( new ValidationError( 'empty_query' ) );
		return;
	}

	if ( ! domainName.match( /^https?:\/\//i ) ) {
		domainName = 'http://' + domainName;
	}

	if ( domainName.includes( '@' ) ) {
		onComplete( new ValidationError( 'invalid_domain' ) );
		return;
	}

	wpcom.req.get(
		{
			path:
				'/domains/' +
				siteId +
				'/' +
				encodeURIComponent( domainName.toLowerCase() ) +
				'/can-redirect',
		},
		function ( serverError, data ) {
			if ( serverError ) {
				onComplete( new ValidationError( serverError.error ) );
			} else if ( ! data.can_redirect ) {
				onComplete( new ValidationError( 'cannot_redirect' ) );
			} else {
				onComplete( null );
			}
		}
	);
}
