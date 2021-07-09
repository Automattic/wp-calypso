/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';

function createSubscriberResourceUrl( category, emailAddress, method ) {
	return (
		'/mailing-lists/' +
		encodeURIComponent( category ) +
		'/subscribers/' +
		encodeURIComponent( emailAddress ) +
		'/' +
		method
	);
}

export function deleteSubscriber( category, emailAddress, hmac, context ) {
	return wpcom.req.post( createSubscriberResourceUrl( category, emailAddress, 'delete' ), {
		hmac,
		context,
	} );
}

export function addSubscriber( category, emailAddress, hmac, context ) {
	return wpcom.req.post( createSubscriberResourceUrl( category, emailAddress, 'new' ), {
		hmac,
		context,
	} );
}
