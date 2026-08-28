import { Visibility } from '@automattic/data-stores/src/site/types';
import { ONBOARDING_FLOW, createSite } from '@automattic/onboarding';
import {
	clearWowFunnelSite,
	getRememberedWowFunnelSite,
	getWowFunnelKey,
	logWowFunnelEvent,
	rememberWowFunnelSite,
} from './wow-funnel';
import type { RememberedWowFunnelSite } from './wow-funnel';

/**
 * Creating a WoW funnel's site, kept apart from the rest of the funnel model on purpose.
 *
 * This is the only part of the funnel that needs `@automattic/onboarding` and the data-stores
 * site types, and those barrels reach all the way into the component library — so importing them
 * pulls i18n-calypso into every consumer. The hand-off side (readiness, destination, the
 * post-checkout step) needs none of that, and site-spec's tests fall over when it arrives.
 *
 * The seam is the same one the funnel already has: creating the site, versus deciding where the
 * customer goes once it is built.
 */
/**
 * In-flight background-creation promises, keyed by funnel slug. Lets the create-site step await the
 * same request the flow-entry side effect started, so we never create two sites for one funnel.
 */
const inFlight: Record< string, Promise< RememberedWowFunnelSite > | undefined > = {};

/**
 * Forget a funnel run completely, so the next entry builds a new site.
 *
 * Clearing sessionStorage alone is not enough: the in-flight cache holds the resolved promise for
 * the run's site, and startWowFunnelSite() consults it after the remembered-site check — so the
 * discarded site would be handed straight back.
 * @param funnelSlug The funnel slug.
 * @param funnelArgs Args from the entry URL.
 */
export function forgetWowFunnelRun(
	funnelSlug: string,
	funnelArgs: Record< string, string > = {}
): void {
	clearWowFunnelSite();
	inFlight[ getWowFunnelKey( funnelSlug, funnelArgs ) ] = undefined;
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
	const funnelKey = getWowFunnelKey( funnelSlug, funnelArgs );

	const remembered = getRememberedWowFunnelSite( funnelSlug, funnelArgs );
	if ( remembered ) {
		return Promise.resolve( remembered );
	}

	const existing = inFlight[ funnelKey ];
	if ( existing ) {
		return existing;
	}

	const request = ( async () => {
		logWowFunnelEvent( 'start_site_creation', { funnel: funnelSlug } );

		const site = await createSite(
			ONBOARDING_FLOW,
			'', // themeSlugWithRepo — default theme.
			Visibility.PublicNotIndexed, // coming soon.
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
			funnelKey,
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

	inFlight[ funnelKey ] = request;
	request.catch( ( error ) => {
		logWowFunnelEvent( 'start_site_error', {
			funnel: funnelSlug,
			error: error instanceof Error ? error.message : String( error ),
		} );
		// Clear so a later attempt (e.g. the create-site fallback) can retry.
		inFlight[ funnelKey ] = undefined;
	} );

	return request;
}
