/**
 * Internal dependencies
 */
import { isSubdomain, isDomain } from 'calypso/lib/domains';

// Because of the unified nav, we need to maintain some existing event names which are being used in funnels. See https://github.com/Automattic/wp-calypso/issues/50847#issuecomment-800258221
function mapEvents( event ) {
	switch ( event ) {
		case 'plans':
			return 'plan';
		case 'themes':
			return 'theme';
		case 'home':
			return 'customer_home';
		default:
			return event;
	}
}

export function urlToEventName( url ) {
	if ( typeof url !== 'string' ) {
		return null;
	}

	const urlParts = url.split( '/' );
	// Remove empty strings and domains
	const builtEvent = urlParts
		.filter( ( part ) => part !== '' && ! isSubdomain( part ) && ! isDomain( part ) )
		.join( '_' );
	const event = mapEvents( builtEvent.replace( /-/g, '_' ) );
	return `calypso_mysites_sidebar_${ event }_clicked`;
}
