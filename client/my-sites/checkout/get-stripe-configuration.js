/**
 * Internal Dependencies
 */
import wp from 'calypso/lib/wp';

const wpcom = wp.undocumented();

export default async function getStripeConfiguration( requestArgs ) {
	return wpcom.stripeConfiguration( requestArgs );
}
