import { Site } from '@automattic/data-stores';
import { ONBOARDING_FLOW, createSite } from '@automattic/onboarding';
import { logToLogstash } from 'calypso/lib/logstash';

/**
 * A WoW funnel is a CTA-selected onboarding path whose end state is always an Atomic site,
 * with the Atomic build started before the customer picks a domain or pays. The funnel slug is
 * validated server-side against the registry in wp-content/lib/atomic/funnels.php; the client only
 * passes it through.
 *
 * Entry URL shape: /setup/onboarding?wow_funnel=<slug>&dest=<dest>[&blueprint=<id>]
 */

/**
 * Where the customer lands after checkout, when the CTA asks for somewhere specific.
 *
 * - `editor`    — straight into the Site Editor on the built Atomic site.
 * - `site-spec` — the AI site-spec, which polls the funnel's build and hands over when it lands.
 *
 * No (or unrecognized) `dest` means no override: the flow's ordinary post-checkout destination
 * applies.
 */
export type WowFunnelDest = 'editor' | 'site-spec';

const WOW_FUNNEL_DESTS: WowFunnelDest[] = [ 'editor', 'site-spec' ];

/**
 * A funnel site created for this flow, remembered so the create-site step can consume it rather
 * than creating a second site. Persisted in sessionStorage so it survives a refresh mid-flow.
 */
export type RememberedWowFunnelSite = {
	funnelSlug: string;
	blogId: number;
	siteSlug: string;
};

const SESSION_KEY = 'wow-funnel-created-site';

/**
 * In-flight background-creation promises, keyed by funnel slug. Lets the create-site step await the
 * same request the flow-entry side effect started, so we never create two sites for one funnel.
 */
const inFlight: Record< string, Promise< RememberedWowFunnelSite > | undefined > = {};

export function getWowFunnelSlug( queryParams: URLSearchParams ): string | null {
	const raw = queryParams.get( 'wow_funnel' );
	if ( ! raw ) {
		return null;
	}
	// Mirror sanitize_key(): lowercase, [a-z0-9_-] only.
	const slug = raw.toLowerCase().replace( /[^a-z0-9_-]/g, '' );
	return slug || null;
}

/**
 * Input the funnel's server-side follow-up needs, read off the entry URL.
 *
 * Sent as `wow_funnel_args` to /sites/new, where the registered funnel's follow-up consumes it —
 * the blueprint funnel, for instance, seeds its archive import from `blueprint_slug`. Empty for
 * funnels that do no follow-up work.
 */
export function getWowFunnelArgs( queryParams: URLSearchParams ): Record< string, string > {
	const args: Record< string, string > = {};

	const blueprint = queryParams.get( 'blueprint' );
	if ( blueprint ) {
		args.blueprint_slug = blueprint;
	}

	return args;
}

export function getWowFunnelDest( queryParams: URLSearchParams ): WowFunnelDest | null {
	const dest = queryParams.get( 'dest' );
	return WOW_FUNNEL_DESTS.find( ( d ) => d === dest ) ?? null;
}

export function logWowFunnelEvent(
	type: string,
	properties: Record< string, unknown > = {}
): void {
	void logToLogstash( {
		feature: 'calypso_client',
		message: 'WoW funnel onboarding',
		severity: 'debug',
		properties: {
			type: `wow_funnel_${ type }`,
			...properties,
		},
	} ).catch( () => {} );
}

function readRemembered(): RememberedWowFunnelSite | null {
	try {
		const raw = window.sessionStorage.getItem( SESSION_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw ) as RememberedWowFunnelSite;
		if ( parsed && parsed.funnelSlug && parsed.blogId && parsed.siteSlug ) {
			return parsed;
		}
	} catch {
		// Corrupt value — treat as absent.
	}
	return null;
}

export function getRememberedWowFunnelSite( funnelSlug: string ): RememberedWowFunnelSite | null {
	const remembered = readRemembered();
	return remembered && remembered.funnelSlug === funnelSlug ? remembered : null;
}

function rememberWowFunnelSite( site: RememberedWowFunnelSite ): void {
	try {
		window.sessionStorage.setItem( SESSION_KEY, JSON.stringify( site ) );
	} catch {
		// sessionStorage unavailable — the module-level in-flight cache still de-dupes within the
		// session, and create-site falls back to creating the site itself.
	}
}

export function clearWowFunnelSite(): void {
	try {
		window.sessionStorage.removeItem( SESSION_KEY );
	} catch {
		// Ignore.
	}
}

/**
 * Create the funnel's Simple site (which the server immediately fast-provisions to Atomic), once.
 *
 * Single-flight: concurrent callers for the same funnel share one request, and a site already
 * remembered from this session is returned without a second create. The server generates an
 * arbitrary subdomain (empty blog_name + find_available_url on the onboarding flow), so no
 * siteUrl/title is needed here.
 */
export function startWowFunnelSite( {
	funnelSlug,
	funnelArgs,
	siteTitle,
}: {
	funnelSlug: string;
	funnelArgs?: Record< string, string >;
	siteTitle?: string;
} ): Promise< RememberedWowFunnelSite > {
	const remembered = getRememberedWowFunnelSite( funnelSlug );
	if ( remembered ) {
		return Promise.resolve( remembered );
	}

	const existing = inFlight[ funnelSlug ];
	if ( existing ) {
		return existing;
	}

	const request = ( async () => {
		logWowFunnelEvent( 'start_site_creation', { funnel: funnelSlug } );

		const site = await createSite(
			ONBOARDING_FLOW,
			'', // themeSlugWithRepo — default theme.
			Site.Visibility.PublicNotIndexed, // coming soon.
			siteTitle ?? '',
			'#113AF5', // accent — backend requires a value.
			false, // useThemeHeadstart.
			// username: only ever a last-resort blog_name seed, and the server generates the
			// funnel's arbitrary subdomain regardless — see /sites/new's wow-funnel block.
			'',
			null, // partnerBundle.
			undefined, // storedSiteUrl — empty so the server generates an arbitrary subdomain.
			undefined, // domainItem.
			undefined, // sourceSlug.
			undefined, // siteIntent.
			undefined, // siteGoals.
			null, // gardenName.
			null, // gardenPartnerName.
			undefined, // specId.
			undefined, // ref.
			undefined, // provisionTarget.
			undefined, // aiLaunchpadEnabled.
			funnelSlug,
			funnelArgs
		);

		if ( ! site ) {
			throw new Error( 'Failed to create WoW funnel site' );
		}

		const result: RememberedWowFunnelSite = {
			funnelSlug,
			blogId: site.siteId,
			siteSlug: site.siteSlug,
		};
		rememberWowFunnelSite( result );
		logWowFunnelEvent( 'start_site_created', {
			funnel: funnelSlug,
			blog_id: result.blogId,
			site_slug: result.siteSlug,
		} );
		return result;
	} )();

	inFlight[ funnelSlug ] = request;
	request.catch( ( error ) => {
		logWowFunnelEvent( 'start_site_error', {
			funnel: funnelSlug,
			error: error instanceof Error ? error.message : String( error ),
		} );
		// Clear so a later attempt (e.g. the create-site fallback) can retry.
		inFlight[ funnelSlug ] = undefined;
	} );

	return request;
}
