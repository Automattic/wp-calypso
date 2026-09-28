import { addSchemeIfMissing } from 'calypso/lib/url';
import type { ResponseCartGiftDetails } from '@automattic/shopping-cart';

const HTTP_PROTOCOLS = [ 'http:', 'https:' ];

function parseHttpUrl( value: string | undefined ): URL | undefined {
	if ( ! value ) {
		return undefined;
	}
	try {
		const url = new URL( value );
		return HTTP_PROTOCOLS.includes( url.protocol ) ? url : undefined;
	} catch {
		return undefined;
	}
}

/**
 * Where "Back" should go from a gift checkout: the page on the gifted site
 * the visitor came from when the referrer belongs to that site, otherwise
 * the gifted site itself. The referrer is only trusted when its host matches
 * the receiver URL the server put on the cart. That URL usually arrives
 * without a scheme, so one is added before parsing.
 */
export function getGiftCheckoutBackUrl( {
	giftDetails,
	referrer,
}: {
	giftDetails: ResponseCartGiftDetails | undefined;
	referrer: string;
} ): string | undefined {
	const receiverBlogUrl = giftDetails?.receiver_blog_url;
	if ( ! receiverBlogUrl ) {
		return undefined;
	}
	const receiverUrl = parseHttpUrl( addSchemeIfMissing( receiverBlogUrl, 'https' ) );
	if ( ! receiverUrl ) {
		return undefined;
	}

	const referrerUrl = parseHttpUrl( referrer );
	if ( referrerUrl && referrerUrl.host === receiverUrl.host ) {
		return referrerUrl.href;
	}

	return receiverUrl.href;
}
