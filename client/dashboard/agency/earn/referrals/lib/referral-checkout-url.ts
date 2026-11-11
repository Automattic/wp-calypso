const CHECKOUT_PATHS_BY_HOST: Record< string, string > = {
	'wordpress.com': '/checkout/',
	'agencies.automattic.com': '/client/checkout',
};

/**
 * Whether a URL is a client's referral checkout link. The link reaches the
 * Referrals page through the address bar, so anything else is dropped before
 * it can be shown or copied.
 */
export function isReferralCheckoutUrl( url: string ): boolean {
	try {
		const { protocol, hostname, pathname } = new URL( url );
		const checkoutPath = CHECKOUT_PATHS_BY_HOST[ hostname ];
		return protocol === 'https:' && !! checkoutPath && pathname.startsWith( checkoutPath );
	} catch {
		return false;
	}
}
