import { logToLogstash } from 'calypso/lib/logstash';
import { getTransferFailureMessage } from './atomic-transfer-outcome';
import {
	getSiteAdminUrl,
	getSiteEditorUrl,
	waitForAtomicTransferComplete,
	waitForBlueprintImportComplete,
} from './blueprint-archive-import';

/**
 * A WoW funnel is a CTA-selected onboarding path whose end state is always an Atomic site,
 * with the Atomic build started before the customer picks a domain or pays. The funnel slug is
 * validated server-side against the registry in wp-content/lib/atomic/funnels.php; the client only
 * passes it through.
 *
 * Entry URL shape: /setup/onboarding?wow_funnel=<slug>&dest=<dest>[&blueprint=<id>]
 */

/**
 * Where the customer lands at the END of a funnel — always on the built site.
 *
 * - `editor` — straight into the Site Editor on the built Atomic site.
 *
 * Keeping every destination remote is what makes "end of funnel" a structural fact rather than
 * something inferred from the dest value. Calypso-side work is not a destination; it is an
 * interstitial that runs before the hand-off (see WowFunnelInterstitial).
 */
export type WowFunnelDest = 'editor';

const WOW_FUNNEL_DESTS: WowFunnelDest[] = [ 'editor' ];

/**
 * A Calypso-side step a funnel inserts between checkout and the hand-off.
 *
 * - `site-spec` — collects the owner's details and applies them to the built site.
 *
 * Interstitials live in their own flows and are reached by URL, so they are an ordered list of
 * hops rather than steps spliced into onboarding's step list. The last hop owns the readiness
 * wait and the hand-off, both through the shared helpers below — so a funnel's terminal
 * behaviour is identical whether or not it has interstitials.
 */
export type WowFunnelInterstitial = 'site-spec';

/**
 * What must be true before the customer is handed to the destination.
 *
 * One predicate per funnel is enough because each funnel's is transitively the last thing in its
 * chain: the blueprint import runs behind the Atomic transfer (the backup_import job initiates
 * the transfer as its first step), so `import` already implies `transfer`.
 */
export type WowFunnelReadiness = 'transfer' | 'import';

export type WowFunnelConfig = {
	/** Calypso-side hops between checkout and the hand-off, in order. */
	interstitials: WowFunnelInterstitial[];
	/** Where the customer lands when the CTA does not override it. */
	dest: WowFunnelDest;
	/** What the loading screen waits on before handing over. */
	readiness: WowFunnelReadiness;
	/** How long that wait runs before it gives up and raises a timeout. */
	waitTimeoutSeconds: number;
};

const DEFAULT_WOW_FUNNEL_CONFIG: WowFunnelConfig = {
	interstitials: [],
	dest: 'editor',
	readiness: 'transfer',
	// The observed fast-provision build is well under a minute; this is headroom, not a target.
	waitTimeoutSeconds: 180,
};

/**
 * Per-funnel overrides. Anything unset falls back to DEFAULT_WOW_FUNNEL_CONFIG, so a new funnel
 * that just wants "empty Atomic site, then the editor" needs no entry here at all.
 *
 * Mirrors the server-side registry in wp-content/lib/atomic/wow-funnels.php by slug only: PHP owns
 * what the BUILD does (context, theme, follow-up), this owns what the FLOW does. Keeping flow
 * config client-side also keeps it off the critical path of the post-checkout hand-off.
 */
const WOW_FUNNEL_CONFIG: Record< string, Partial< WowFunnelConfig > > = {
	default: {},
	blueprint: {
		interstitials: [ 'site-spec' ],
		readiness: 'import',
		// The archive restore is genuinely long; this matches the wait site-spec already ran.
		waitTimeoutSeconds: 900,
	},
};

/**
 * Whether the slug names a funnel this client knows how to run.
 *
 * The server ignores an unregistered slug outright — it never enrols the blog and never starts a
 * build — so the client has to degrade the same way. Without this check a typo'd slug would take
 * the funnel path and then sit on the loading screen waiting for a transfer that was never going
 * to happen. Mirrors the server registry by slug; a funnel the server knows and this list does
 * not falls back to ordinary onboarding, which is the same safe failure.
 */
export function isKnownWowFunnel( funnelSlug: string | null ): funnelSlug is string {
	return !! funnelSlug && Object.prototype.hasOwnProperty.call( WOW_FUNNEL_CONFIG, funnelSlug );
}

export function getWowFunnelConfig( funnelSlug: string | null ): WowFunnelConfig {
	return {
		...DEFAULT_WOW_FUNNEL_CONFIG,
		...( ( funnelSlug && WOW_FUNNEL_CONFIG[ funnelSlug ] ) || {} ),
	};
}

/**
 * A funnel site created for this flow, remembered so the create-site step can consume it rather
 * than creating a second site. Persisted in sessionStorage so it survives a refresh mid-flow.
 */
export type RememberedWowFunnelSite = {
	funnelSlug: string;
	/**
	 * Identifies the run, not just the funnel. Two CTAs can share a funnel slug and differ in
	 * what they build — the blueprint funnel's whole subject is its `blueprint_slug` — so the
	 * slug alone would resume a site built from a different blueprint.
	 */
	funnelKey: string;
	blogId: number;
	siteSlug: string;
};

const SESSION_KEY = 'wow-funnel-created-site';

/**
 * A stable identity for one funnel run: the slug plus the args that decide what gets built.
 * @param funnelSlug The funnel slug.
 * @param funnelArgs Args from the entry URL.
 * @returns A key that changes whenever the run would build something different.
 */
export function getWowFunnelKey(
	funnelSlug: string,
	funnelArgs: Record< string, string > = {}
): string {
	const args = Object.keys( funnelArgs )
		.sort()
		.map( ( key ) => `${ key }=${ funnelArgs[ key ] }` )
		.join( '&' );
	return args ? `${ funnelSlug }:${ args }` : funnelSlug;
}

/**
 * Input the funnel's server-side follow-up needs, read off the entry URL.
 *
 * Sent as `wow_funnel_args` to /sites/new, where the registered funnel's follow-up consumes it —
 * the blueprint funnel, for instance, seeds its archive import from `blueprint_slug`. Empty for
 * funnels that do no follow-up work.
 */
export function getWowFunnelSlug( queryParams: URLSearchParams ): string | null {
	const raw = queryParams.get( 'wow_funnel' );
	if ( ! raw ) {
		return null;
	}
	// Mirror sanitize_key(): lowercase, [a-z0-9_-] only.
	const slug = raw.toLowerCase().replace( /[^a-z0-9_-]/g, '' );
	return slug || null;
}

export function getWowFunnelArgs( queryParams: URLSearchParams ): Record< string, string > {
	const args: Record< string, string > = {};

	const blueprint = queryParams.get( 'blueprint' );
	if ( blueprint ) {
		args.blueprint_slug = blueprint;
	}

	return args;
}

/**
 * The funnel's destination. `dest` in the URL is an OVERRIDE for a CTA that wants somewhere other
 * than the funnel's default; absent or unrecognized, the configured default applies.
 *
 * Never null: a missing `dest` used to drop the customer silently into ordinary onboarding
 * destinations, which looked like working onboarding and wasn't.
 */
export function getWowFunnelDest(
	queryParams: URLSearchParams,
	funnelSlug: string | null
): WowFunnelDest {
	const dest = queryParams.get( 'dest' );
	return WOW_FUNNEL_DESTS.find( ( d ) => d === dest ) ?? getWowFunnelConfig( funnelSlug ).dest;
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
		if ( parsed && parsed.funnelKey && parsed.blogId && parsed.siteSlug ) {
			return parsed;
		}
	} catch {
		// Corrupt value — treat as absent.
	}
	return null;
}

export function getRememberedWowFunnelSite(
	funnelSlug: string,
	funnelArgs: Record< string, string > = {}
): RememberedWowFunnelSite | null {
	const remembered = readRemembered();
	const key = getWowFunnelKey( funnelSlug, funnelArgs );
	return remembered && remembered.funnelKey === key ? remembered : null;
}

export function rememberWowFunnelSite( site: RememberedWowFunnelSite ): void {
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
 * Is this site already paid for?
 *
 * A funnel run exists to sell a plan for the site it builds, so a site that already has one must
 * never be resumed — checkout would offer a second plan for a site that does not need one.
 * @param site The site, as returned by the site store.
 * @returns True when the site holds a paid plan.
 */
export function wowFunnelSiteIsPaid( site: { plan?: { is_free?: boolean } } | undefined ): boolean {
	return !! site?.plan && ! site.plan.is_free;
}

const WAIT_TIMED_OUT = Symbol( 'wow-funnel-wait-timed-out' );

/**
 * Wait until the funnel's build is genuinely ready to be handed over.
 *
 * This is the gate that was missing: the hand-off used to fire the moment checkout returned, on
 * the assumption that the build had finished during domain selection and checkout. It usually
 * had. When it had not, the customer landed on the pre-switcheroo Simple site — the site was
 * fine and finished moments later, but their first impression was the wrong site.
 *
 * Throws on failure or timeout, matching how every other Atomic wait in stepper reports (see
 * bundle-transfer, use-wait-for-atomic), so the flow's existing exception handling routes it to
 * the shared error step with a message that already reads correctly for a timeout.
 */
export async function waitForWowFunnelReady( {
	funnelSlug,
	siteIdentifier,
}: {
	funnelSlug: string;
	siteIdentifier: string;
} ): Promise< void > {
	const { readiness, waitTimeoutSeconds } = getWowFunnelConfig( funnelSlug );

	// Check before sleeping. A funnel's build starts before checkout, so by the time this runs it
	// has usually already finished — and the default poll waits a full interval before its first
	// request, which would hold the customer on a loading screen for five seconds to learn
	// something that was already true. Safe here precisely because the work predates this page:
	// there is no risk of reading a previous run's terminal state.
	const pollNow = { initialDelayMs: 0 };

	const work = ( async () => {
		// Every readiness level starts with the transfer — the site cannot be ready before it is
		// Atomic — and `import` simply waits for one more thing behind it.
		await waitForAtomicTransferComplete( siteIdentifier, pollNow );
		if ( 'import' === readiness ) {
			await waitForBlueprintImportComplete( siteIdentifier, pollNow );
		}
	} )();

	let timer: ReturnType< typeof setTimeout > | undefined;
	const timeout = new Promise< typeof WAIT_TIMED_OUT >( ( resolve ) => {
		timer = setTimeout( () => resolve( WAIT_TIMED_OUT ), waitTimeoutSeconds * 1000 );
	} );

	try {
		// Settling the work promise here (rather than letting the race reject) keeps a late
		// rejection from surfacing as an unhandled rejection after a timeout has already won.
		const outcome = await Promise.race( [
			work.then(
				() => 'ready' as const,
				() => 'failed' as const
			),
			timeout,
		] );

		if ( WAIT_TIMED_OUT === outcome ) {
			logWowFunnelEvent( 'handoff_wait_timeout', {
				funnel: funnelSlug,
				readiness,
				timeout_seconds: waitTimeoutSeconds,
			} );
			throw new Error( getTransferFailureMessage( 'timeout' ) );
		}

		if ( 'failed' === outcome ) {
			logWowFunnelEvent( 'handoff_wait_failed', { funnel: funnelSlug, readiness } );
			throw new Error( getTransferFailureMessage( 'error' ) );
		}
	} finally {
		clearTimeout( timer );
	}
}

/**
 * Build the URL the funnel hands the customer over to.
 *
 * Resolved AFTER the readiness wait, deliberately: a funnel site's address changes mid-flow when
 * the Simple site becomes Atomic, so a URL captured at flow start points at the old one. Goes
 * through the site's own admin URL and Jetpack SSO for the same reason the blueprint hand-off
 * does — the customer holds a WordPress.com session, not a session on their new Atomic site.
 */
export async function getWowFunnelHandoffUrl( {
	dest,
	siteIdentifier,
	startWalkthrough = false,
}: {
	dest: WowFunnelDest;
	siteIdentifier: string;
	startWalkthrough?: boolean;
} ): Promise< string > {
	switch ( dest ) {
		case 'editor':
		default: {
			const adminUrl = await getSiteAdminUrl( siteIdentifier );
			// `p` opens the front page rather than whatever the editor last had; `canvasEdit`
			// because a plain site-editor.php load stays in view mode.
			return getSiteEditorUrl( adminUrl, { canvasEdit: true, path: '/', startWalkthrough } );
		}
	}
}
