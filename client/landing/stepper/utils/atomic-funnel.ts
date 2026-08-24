import { Site } from '@automattic/data-stores';
import { ONBOARDING_FLOW, createSite } from '@automattic/onboarding';
import { logToLogstash } from 'calypso/lib/logstash';

/**
 * An atomic funnel is a CTA-selected onboarding path whose end state is always an Atomic site,
 * with the Atomic build started before the customer picks a domain or pays. The funnel slug is
 * validated server-side against the registry in wp-content/lib/atomic/funnels.php; the client only
 * passes it through.
 *
 * Entry URL shape: /setup/onboarding?atomic_funnel=<slug>&dest=<dest>[&blueprint=<id>]
 */

/**
 * Where the customer lands after checkout, chosen by the CTA.
 *
 * - `site-spec` — the AI site-spec step (used by the blueprint funnel).
 * - `big-sky`   — the Big Sky / AI setup chooser.
 * - `manual`    — the default post-checkout onboarding (Launchpad / My Home).
 */
export type AtomicFunnelDest = 'site-spec' | 'big-sky' | 'manual';

const ATOMIC_FUNNEL_DESTS: AtomicFunnelDest[] = [ 'site-spec', 'big-sky', 'manual' ];

/**
 * A funnel site created for this flow, remembered so the create-site step can consume it rather
 * than creating a second site. Persisted in sessionStorage so it survives a refresh mid-flow.
 */
export type RememberedAtomicFunnelSite = {
	funnelSlug: string;
	blogId: number;
	siteSlug: string;
};

const SESSION_KEY = 'atomic-funnel-created-site';

/**
 * In-flight background-creation promises, keyed by funnel slug. Lets the create-site step await the
 * same request the flow-entry side effect started, so we never create two sites for one funnel.
 */
const inFlight: Record< string, Promise< RememberedAtomicFunnelSite > | undefined > = {};

export function getAtomicFunnelSlug( queryParams: URLSearchParams ): string | null {
	const raw = queryParams.get( 'atomic_funnel' );
	if ( ! raw ) {
		return null;
	}
	// Mirror sanitize_key(): lowercase, [a-z0-9_-] only.
	const slug = raw.toLowerCase().replace( /[^a-z0-9_-]/g, '' );
	return slug || null;
}

export function getAtomicFunnelDest( queryParams: URLSearchParams ): AtomicFunnelDest {
	const dest = queryParams.get( 'dest' );
	return ATOMIC_FUNNEL_DESTS.find( ( d ) => d === dest ) ?? 'manual';
}

/**
 * Funnel-specific args pulled from the entry URL, forwarded to the server as atomic_funnel_args.
 * Currently just the blueprint slug for the blueprint funnel.
 */
export function getAtomicFunnelArgs( queryParams: URLSearchParams ): Record< string, string > {
	const args: Record< string, string > = {};
	const blueprint = queryParams.get( 'blueprint' );
	if ( blueprint ) {
		args.blueprint_slug = blueprint;
	}
	return args;
}

export function logAtomicFunnelEvent(
	type: string,
	properties: Record< string, unknown > = {}
): void {
	void logToLogstash( {
		feature: 'calypso_client',
		message: 'Atomic funnel onboarding',
		severity: 'debug',
		properties: {
			type: `atomic_funnel_${ type }`,
			...properties,
		},
	} ).catch( () => {} );
}

function readRemembered(): RememberedAtomicFunnelSite | null {
	try {
		const raw = window.sessionStorage.getItem( SESSION_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw ) as RememberedAtomicFunnelSite;
		if ( parsed && parsed.funnelSlug && parsed.blogId && parsed.siteSlug ) {
			return parsed;
		}
	} catch {
		// Corrupt value — treat as absent.
	}
	return null;
}

export function getRememberedAtomicFunnelSite(
	funnelSlug: string
): RememberedAtomicFunnelSite | null {
	const remembered = readRemembered();
	return remembered && remembered.funnelSlug === funnelSlug ? remembered : null;
}

function rememberAtomicFunnelSite( site: RememberedAtomicFunnelSite ): void {
	try {
		window.sessionStorage.setItem( SESSION_KEY, JSON.stringify( site ) );
	} catch {
		// sessionStorage unavailable — the module-level in-flight cache still de-dupes within the
		// session, and create-site falls back to creating the site itself.
	}
}

export function clearAtomicFunnelSite(): void {
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
export function startAtomicFunnelSite( {
	funnelSlug,
	funnelArgs,
	siteTitle,
	username,
}: {
	funnelSlug: string;
	funnelArgs: Record< string, string >;
	siteTitle?: string;
	username: string;
} ): Promise< RememberedAtomicFunnelSite > {
	const remembered = getRememberedAtomicFunnelSite( funnelSlug );
	if ( remembered ) {
		return Promise.resolve( remembered );
	}

	const existing = inFlight[ funnelSlug ];
	if ( existing ) {
		return existing;
	}

	const request = ( async () => {
		logAtomicFunnelEvent( 'start_site_creation', { funnel: funnelSlug } );

		const site = await createSite(
			ONBOARDING_FLOW,
			'', // themeSlugWithRepo — default theme.
			Site.Visibility.PublicNotIndexed, // coming soon.
			siteTitle ?? '',
			'#113AF5', // accent — backend requires a value.
			false, // useThemeHeadstart.
			username,
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
			throw new Error( 'Failed to create atomic funnel site' );
		}

		const result: RememberedAtomicFunnelSite = {
			funnelSlug,
			blogId: site.siteId,
			siteSlug: site.siteSlug,
		};
		rememberAtomicFunnelSite( result );
		logAtomicFunnelEvent( 'start_site_created', {
			funnel: funnelSlug,
			blog_id: result.blogId,
			site_slug: result.siteSlug,
		} );
		return result;
	} )();

	inFlight[ funnelSlug ] = request;
	request.catch( ( error ) => {
		logAtomicFunnelEvent( 'start_site_error', {
			funnel: funnelSlug,
			error: error instanceof Error ? error.message : String( error ),
		} );
		// Clear so a later attempt (e.g. the create-site fallback) can retry.
		inFlight[ funnelSlug ] = undefined;
	} );

	return request;
}
