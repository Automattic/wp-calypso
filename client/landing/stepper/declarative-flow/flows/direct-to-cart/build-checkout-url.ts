import { addQueryArgs } from '@wordpress/url';

const TRANSFERRING_FLOW_PATH = '/setup/transferring-hosted-site';

/**
 * Appends `wpcom_purchase=1` and `wpcom_site=<siteSlug>` to the partner's
 * return URL so they can distinguish a real return-from-purchase from direct
 * navigation.
 */
export function appendReturnSignals( externalUrl: string, siteSlug: string ): string {
	return addQueryArgs( externalUrl, {
		wpcom_purchase: '1',
		wpcom_site: siteSlug,
	} );
}

interface BuildChainedCheckoutUrlArgs {
	siteSlug: string;
	/**
	 * Numeric site ID. Optional because the resume path doesn't store it.
	 * When present, it's embedded in the transferring-hosted-site URL so
	 * WAIT_FOR_ATOMIC's useSiteData() hook can pick it up and start polling.
	 */
	siteId?: number;
	/** Plan slug to embed in the checkout path so checkout auto-adds it to the cart. */
	plan: string;
	/** Sanitized external URL (already includes return signals), or null to fall back to /home/<slug>. */
	externalRedirect: string | null;
	coupon: string | null;
}

/**
 * Builds the URL we navigate to from PROCESSING. The user lands on /checkout,
 * which on success navigates to redirect_to. We chain through
 * /setup/transferring-hosted-site (which waits for atomic transfer) and then
 * to the external redirect.
 *
 * Encoding: addQueryArgs handles one level of URL-encoding. The external URL
 * is passed in already-formed (no manual encoding here); addQueryArgs encodes
 * it as the value of redirect_to when assembling the transferring URL, and
 * encodes the transferring URL as the value of the outer redirect_to.
 */
export function buildChainedCheckoutUrl( args: BuildChainedCheckoutUrlArgs ): string {
	const { siteSlug, siteId, plan, externalRedirect, coupon } = args;

	const transferringOrHome = externalRedirect
		? addQueryArgs( TRANSFERRING_FLOW_PATH, {
				redirect_to: externalRedirect,
				siteSlug,
				siteId: siteId !== undefined ? String( siteId ) : undefined,
		  } )
		: `/home/${ siteSlug }`;

	// Path: /checkout/<plan>/<site>. The plan-first form makes checkout
	// auto-populate the cart if it's empty — this matters for the
	// resumability fast-path where a user re-visits after emptying their cart.
	return addQueryArgs(
		`/checkout/${ encodeURIComponent( plan ) }/${ encodeURIComponent( siteSlug ) }`,
		{
			redirect_to: transferringOrHome,
			coupon: coupon || undefined,
			signup: '1',
		}
	);
}
