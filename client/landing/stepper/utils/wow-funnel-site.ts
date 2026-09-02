import { Visibility } from '@automattic/data-stores/src/site/types';
import { ONBOARDING_FLOW, createSite } from '@automattic/onboarding';
import wpcom from 'calypso/lib/wp';
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
 * The unpaid funnel site the customer already has in flight, as the server reports it.
 *
 * The funnel builds an Atomic site before anyone pays for it, so a customer who leaves before
 * checkout leaves one standing. The server allows exactly one at a time and refuses to build a
 * second, so this is what a funnel entry has to consult before it tries to start a run.
 */
export type PendingWowFunnelSite = {
	blogId: number;
	siteSlug: string;
	/** The run that built it, which is not necessarily the run being entered now. */
	funnelSlug: string;
	funnelArgs: Record< string, string >;
};

/**
 * Ask the server whether this customer already has an unpaid funnel site.
 *
 * The server drops its own pointer as it reads it, so an empty answer means the previous site is
 * genuinely gone — paid for, or reverted — not merely forgotten by this browser.
 * @returns The pending site, or null when the customer has none (and on any lookup failure, where
 *          treating it as absent lets /sites/new have the final say).
 */
export async function fetchPendingWowFunnelSite(): Promise< PendingWowFunnelSite | null > {
	try {
		const response = ( await wpcom.req.get( {
			path: '/wow-funnel/pending',
			apiNamespace: 'wpcom/v2',
		} ) ) as {
			pending?: boolean;
			blog_id?: number;
			site_slug?: string;
			funnel_slug?: string;
			funnel_args?: Record< string, string >;
		};

		if ( ! response?.pending || ! response.blog_id || ! response.site_slug ) {
			return null;
		}

		return {
			blogId: Number( response.blog_id ),
			siteSlug: String( response.site_slug ),
			funnelSlug: String( response.funnel_slug ?? '' ),
			funnelArgs: response.funnel_args ?? {},
		};
	} catch ( error ) {
		logWowFunnelEvent( 'pending_lookup_error', {
			error: error instanceof Error ? error.message : String( error ),
		} );
		return null;
	}
}

/**
 * Does the pending site's cart still hold what the customer picked before they left?
 *
 * This is the difference between the two ways of resuming: a cart with something in it means they
 * got as far as checkout and did not pay, so put them back there; an empty one means they never
 * chose a plan, so send them to pick one.
 * @param blogId The pending site's blog ID.
 * @returns True when the site's persisted cart has products in it.
 */
export async function wowFunnelSiteHasCartItems( blogId: number ): Promise< boolean > {
	try {
		const cart = ( await wpcom.req.get( `/me/shopping-cart/${ blogId }` ) ) as {
			products?: unknown[];
		};
		return Array.isArray( cart?.products ) && cart.products.length > 0;
	} catch ( error ) {
		// An unreadable cart is indistinguishable from an empty one here, and plans is the safe
		// place to land: the customer can still reach checkout from there.
		logWowFunnelEvent( 'cart_lookup_error', {
			blog_id: blogId,
			error: error instanceof Error ? error.message : String( error ),
		} );
		return false;
	}
}

/**
 * Take the pending site over as this run's site.
 *
 * Remembered under the run being entered now, not the run that built it: with one unpaid site
 * allowed at a time, a different CTA cannot build its own anyway, and keying it any other way
 * would leave create-site asking for a second site the server will refuse.
 * @param pending    The pending site.
 * @param funnelSlug The slug of the run being entered.
 * @param funnelArgs Args of the run being entered.
 * @returns The remembered site, or null when sessionStorage would not hold it — in which case
 *          nothing must be built on the assumption that a later page load will remember this.
 */
export function adoptWowFunnelSite(
	pending: PendingWowFunnelSite,
	funnelSlug: string,
	funnelArgs: Record< string, string > = {}
): RememberedWowFunnelSite | null {
	const site: RememberedWowFunnelSite = {
		funnelSlug,
		funnelKey: getWowFunnelKey( funnelSlug, funnelArgs ),
		blogId: pending.blogId,
		siteSlug: pending.siteSlug,
	};

	return rememberWowFunnelSite( site ) ? site : null;
}

/**
 * Create the funnel's site, or take over the one the throttle refused to duplicate.
 *
 * /sites/new allows one unpaid funnel site per customer, so a create can legitimately fail
 * because the customer already has one — a second tab, or a session whose memory of the run was
 * lost. Failing the flow there would strand them; adopting the site the server is holding is what
 * they were going to get anyway.
 * @param options            Options.
 * @param options.funnelSlug The funnel slug.
 * @param options.funnelArgs Args from the entry URL.
 * @param options.siteTitle  Optional site title.
 * @returns The created or adopted site.
 */
async function createSiteOrAdoptPending( {
	funnelSlug,
	funnelArgs,
	siteTitle,
}: {
	funnelSlug: string;
	funnelArgs?: Record< string, string >;
	siteTitle?: string;
} ): Promise< { siteId: number; siteSlug: string } > {
	let creationError: unknown;
	let site;

	try {
		site = await createSite(
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
	} catch ( error ) {
		creationError = error;
	}

	if ( site ) {
		return site;
	}

	const pending = await fetchPendingWowFunnelSite();
	if ( pending ) {
		logWowFunnelEvent( 'start_site_adopted_pending', {
			funnel: funnelSlug,
			blog_id: pending.blogId,
			pending_funnel: pending.funnelSlug,
		} );
		return { siteId: pending.blogId, siteSlug: pending.siteSlug };
	}

	throw creationError instanceof Error
		? creationError
		: new Error( 'Failed to create WoW funnel site' );
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

		const site = await createSiteOrAdoptPending( { funnelSlug, funnelArgs, siteTitle } );

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
