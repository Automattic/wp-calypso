/**
 * The Newsletter page in wp-admin is a router mounted on `admin.php?page=jetpack-newsletter`.
 * wp-admin already owns the query string, so the router reads its own route and search from a
 * single `p` parameter: a top-level `tab` is ignored.
 *
 * Which tab opens when none is named is a moving target — it follows whichever tabs are
 * enabled — so every link states the tab it wants. `'default'` says that deliberately, for
 * links that mean the Newsletter section rather than one of its tabs.
 */

const ADMIN_PAGE = 'jetpack-newsletter';

/** The tabs the Newsletter router knows, mirroring its own `NewsletterTab`. */
export type NewsletterTab = 'overview' | 'stats' | 'subscribers' | 'settings';

export type NewsletterAdminUrlOptions =
	| {
			tab: 'subscribers';
			/** Opens this subscriber's details alongside the list. */
			subscriber?: number;
			/**
			 * The subscriber's WordPress.com user id, absent for email-only subscribers. The
			 * details panel opens on either id, so this works on its own.
			 */
			user?: number;
	  }
	| { tab: Exclude< NewsletterTab, 'subscribers' > | 'default' };

function newsletterRoute( options: NewsletterAdminUrlOptions ): string {
	const route = `/?tab=${ options.tab }`;

	if ( options.tab !== 'subscribers' ) {
		return route;
	}

	const { subscriber, user } = options;
	const selection = [
		subscriber ? `subscriber=${ subscriber }` : '',
		user ? `u=${ user }` : '',
	].filter( Boolean );

	return selection.length ? `${ route }&${ selection.join( '&' ) }` : route;
}

/**
 * Builds a link into the wp-admin Newsletter page.
 * @param adminUrl The site's wp-admin URL, with or without a trailing slash.
 * @param options Which tab to open, and which subscriber to select on the Subscribers tab.
 * @returns The absolute URL.
 */
export function newsletterAdminUrl( adminUrl: string, options: NewsletterAdminUrlOptions ): string {
	const base = adminUrl.endsWith( '/' ) ? adminUrl : `${ adminUrl }/`;
	const pageUrl = `${ base }admin.php?page=${ ADMIN_PAGE }`;

	if ( options.tab === 'default' ) {
		return pageUrl;
	}

	return `${ pageUrl }&p=${ encodeURIComponent( newsletterRoute( options ) ) }`;
}

/**
 * Newsletter > Subscribers shipped in Jetpack 16.1. Below that, the Newsletter page renders the
 * legacy settings app and ignores the route, so self-hosted sites below it still manage
 * subscribers on Jetpack Cloud. Simple and Atomic sites always have the wp-admin page.
 */
const SUBSCRIBERS_JETPACK_VERSION = [ 16, 1 ];

/**
 * Compares a Jetpack version string against `minimum`, following the backend's
 * `version_compare()` on the shapes Jetpack ships: `16.1.1` is above `16.1`, a prerelease of
 * the minimum itself (`16.1-beta`) is below it, and a prerelease of anything higher is not.
 */
function isAtLeastVersion( jetpackVersion: string, minimum: number[] ): boolean {
	const parts = jetpackVersion.match( /\d+/g )?.map( Number );

	if ( ! parts?.length ) {
		return false;
	}

	for ( let index = 0; index < Math.max( parts.length, minimum.length ); index++ ) {
		const part = parts[ index ] ?? 0;
		const min = minimum[ index ] ?? 0;

		if ( part !== min ) {
			return part > min;
		}
	}

	// Numerically identical, so only a prerelease suffix separates them.
	return /^\d+(\.\d+)*$/.test( jetpackVersion );
}

/**
 * Whether a site manages its subscribers on the wp-admin Newsletter page rather than on
 * Jetpack Cloud. Mirrors `get_jetpack_subscribers_url()` on the backend.
 * @param site A site's connection facts.
 * @param site.isSelfHostedJetpack Jetpack-connected and not Atomic; Atomic always has the page.
 * @param site.jetpackVersion The site's Jetpack version, when known.
 */
export function hasNewsletterSubscribersPage( {
	isSelfHostedJetpack,
	jetpackVersion,
}: {
	isSelfHostedJetpack: boolean;
	jetpackVersion?: string;
} ): boolean {
	if ( ! isSelfHostedJetpack ) {
		return true;
	}

	return !! jetpackVersion && isAtLeastVersion( jetpackVersion, SUBSCRIBERS_JETPACK_VERSION );
}
