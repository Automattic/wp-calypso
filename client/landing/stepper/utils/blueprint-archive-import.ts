import { addQueryArgs } from '@wordpress/url';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { transferStates, TransferStates } from 'calypso/state/automated-transfer/constants';

export const BLUEPRINT_ARCHIVE_IMPORT_QUERY_VALUE = '1';

// Reuse the flow that already hosts the AI site-spec step.
const BLUEPRINT_ARCHIVE_SITE_SPEC_PATH = '/setup/ai-site-builder-spec/site-spec';

export function getStandaloneBlueprintArchiveSlug(
	blueprint: string | null,
	playgroundId: string | null,
	buildDest: string | null
): string | null {
	return ! playgroundId && buildDest === 'wow' ? blueprint : null;
}

type ImportStatusResponse = {
	importId?: string | null;
	siteId?: number | null;
	type?: string | null;
	importStatus?: string | null;
};

type SiteResponse = {
	URL?: string;
	options?: {
		admin_url?: string;
	};
};

type AtomicTransferResponse = {
	status?: TransferStates;
};

const wait = ( ms: number ) => new Promise< void >( ( resolve ) => setTimeout( resolve, ms ) );

// Terminal states returned by GET /sites/{id}/imports (see Import_V1_1_Helpers::translate_status).
const IMPORT_SUCCESS = 'importSuccess';
const IMPORT_FAILURE_STATUSES = [ 'importFailure', 'importExpired', 'importStopped' ];

// Terminal Atomic transfer states (see calypso/state/automated-transfer/constants).
const ATOMIC_TRANSFER_COMPLETE_STATES: TransferStates[] = [
	transferStates.COMPLETE,
	transferStates.COMPLETED,
];
const ATOMIC_TRANSFER_FAILURE_STATES: TransferStates[] = [
	transferStates.FAILURE,
	transferStates.ERROR,
	transferStates.REVERTED,
];

export function getBlueprintArchiveSiteIdentifier( {
	siteSlug,
	siteId,
}: {
	siteSlug?: string | null;
	siteId?: string | number | null;
} ): string | null {
	if ( siteSlug ) {
		return siteSlug;
	}

	if ( siteId && String( siteId ) !== '0' ) {
		return String( siteId );
	}

	return null;
}

export function getBlueprintArchiveSiteSpecUrl( {
	siteSlug,
	siteId,
	blueprintSlug,
	ref,
	source,
	wowFunnel,
}: {
	siteSlug?: string | null;
	siteId?: string | number | null;
	blueprintSlug: string;
	ref?: string | null;
	source?: string | null;
	wowFunnel?: string | null;
} ): string {
	return addQueryArgs( BLUEPRINT_ARCHIVE_SITE_SPEC_PATH, {
		blueprint_archive_import: BLUEPRINT_ARCHIVE_IMPORT_QUERY_VALUE,
		blueprint_slug: blueprintSlug,
		...( siteSlug ? { siteSlug } : {} ),
		...( siteId && String( siteId ) !== '0' ? { siteId } : {} ),
		...( ref ? { ref } : {} ),
		...( source ? { source } : {} ),
		// A funnel run's import already ran server-side, before checkout. site-spec keys its
		// "do not start one" guard off this param, so it has to survive into the URL — without
		// it the page cannot tell a funnel hand-off from a standalone run and imports again.
		...( wowFunnel ? { wow_funnel: wowFunnel } : {} ),
	} );
}

/**
 * Pre-checkout validation: does the blueprint slug resolve to a usable archive
 * on the host site? Resolves true/false; never throws.
 */
export async function checkBlueprintExists( blueprintSlug: string ): Promise< boolean > {
	if ( ! blueprintSlug ) {
		return false;
	}

	try {
		await wpcom.req.get( {
			path: `/blueprint-archive/${ encodeURIComponent( blueprintSlug ) }`,
			apiNamespace: 'wpcom/v2',
		} );
		return true;
	} catch {
		return false;
	}
}

/**
 * Kick off the background transfer-to-Atomic + blueprint-archive restore.
 * The single backup_import job handles both and tracks progress on the
 * site's import record, which we poll below.
 */
export async function startBlueprintArchiveImport(
	siteIdentifier: string,
	blueprintSlug: string
): Promise< ImportStatusResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdentifier }/blueprint-archive-import`,
			apiNamespace: 'wpcom/v2',
		},
		{ blueprint_slug: blueprintSlug }
	);
}

/**
 * Poll the site's import status until the backup import finishes.
 * Resolves on success; throws on a terminal failure or timeout.
 */
export async function waitForBlueprintImportComplete(
	siteIdentifier: string,
	{ totalTimeoutSeconds = 900, pollIntervalMs = 5000 } = {}
): Promise< void > {
	const maxFinishTime = Date.now() + totalTimeoutSeconds * 1000;
	let lastStatus: string | null | undefined;

	while ( Date.now() < maxFinishTime ) {
		await wait( pollIntervalMs );

		try {
			const status = ( await wpcom.req.get( {
				path: `/sites/${ siteIdentifier }/imports`,
				apiVersion: '1.1',
			} ) ) as ImportStatusResponse;
			lastStatus = status?.importStatus;

			if ( lastStatus === IMPORT_SUCCESS ) {
				return;
			}

			if ( lastStatus && IMPORT_FAILURE_STATUSES.includes( lastStatus ) ) {
				throw new Error( `Blueprint import failed with status: ${ lastStatus }` );
			}
		} catch ( error ) {
			// A terminal failure we raised ourselves should propagate; transient
			// request errors (e.g. mid-transfer blips) should keep polling.
			if ( error instanceof Error && error.message.startsWith( 'Blueprint import failed' ) ) {
				throw error;
			}
			continue;
		}
	}

	throw new Error(
		`Timed out waiting for blueprint import. Last status: ${ String( lastStatus ) }.`
	);
}

/**
 * Poll the canonical Atomic transfer status endpoint until the site's transfer
 * to Atomic completes. Resolves on a complete state; throws on a terminal
 * failure or timeout. A missing transfer (404 before the backup_import job
 * initiates it) is treated as "keep waiting".
 *
 * Note: the backup_import job runs the transfer as its FIRST step and the
 * archive restore afterwards, so transfer-complete happens before the content
 * is restored. Pair this with waitForBlueprintImportComplete() for full
 * readiness.
 */
export async function waitForAtomicTransferComplete(
	siteIdentifier: string,
	{ totalTimeoutSeconds = 900, pollIntervalMs = 5000 } = {}
): Promise< void > {
	const maxFinishTime = Date.now() + totalTimeoutSeconds * 1000;
	let lastStatus: TransferStates | undefined;

	while ( Date.now() < maxFinishTime ) {
		await wait( pollIntervalMs );

		try {
			const transfer = ( await wpcom.req.get( {
				path: `/sites/${ siteIdentifier }/atomic/transfers/latest`,
				apiNamespace: 'wpcom/v2',
			} ) ) as AtomicTransferResponse;
			lastStatus = transfer?.status;

			if ( lastStatus && ATOMIC_TRANSFER_COMPLETE_STATES.includes( lastStatus ) ) {
				return;
			}

			if ( lastStatus && ATOMIC_TRANSFER_FAILURE_STATES.includes( lastStatus ) ) {
				throw new Error( `Atomic transfer failed with status: ${ lastStatus }` );
			}
		} catch ( error ) {
			if ( error instanceof Error && error.message.startsWith( 'Atomic transfer failed' ) ) {
				throw error;
			}
			// Missing transfer / transient error: keep polling.
			continue;
		}
	}

	throw new Error(
		`Timed out waiting for Atomic transfer. Last status: ${ String( lastStatus ) }.`
	);
}

/**
 * Reconcile the confirmed site spec with the freshly imported blueprint site:
 * writes the owner's site title/tagline, records which blueprint the site was
 * built from, and stores the collected details as agent context so the editor
 * can offer to personalize the blueprint's demo copy.
 *
 * Must run AFTER waitForBlueprintImportComplete(): the archive restore replaces
 * the site's options wholesale, so anything written before it is overwritten.
 *
 * Resolves either way — a failure here costs the user personalization, not
 * their site, so it must never block the hand-off to the editor.
 */
export async function applyBlueprintSpec(
	siteIdentifier: string,
	specId: string,
	blueprintSlug?: string | null
): Promise< boolean > {
	if ( ! specId ) {
		return false;
	}

	try {
		await wpcom.req.post(
			{
				path: `/sites/${ siteIdentifier }/big-sky/apply-blueprint-spec`,
				apiNamespace: 'wpcom/v2',
			},
			{
				spec_id: specId,
				...( blueprintSlug ? { blueprint_id: blueprintSlug } : {} ),
			}
		);
		return true;
	} catch ( error ) {
		logBlueprintArchiveEvent( 'apply_spec_error', {
			site_identifier: siteIdentifier,
			error: error instanceof Error ? error.message : String( error ),
		} );
		return false;
	}
}

export async function getSiteAdminUrl( siteIdentifier: string ): Promise< string > {
	const site = ( await wpcom.req.get(
		{
			path: `/sites/${ siteIdentifier }`,
			apiVersion: '1.1',
		},
		{
			fields: 'ID,URL,options',
			options: 'admin_url',
		}
	) ) as SiteResponse;

	return site?.options?.admin_url ?? `https://${ siteIdentifier }/wp-admin/`;
}

/**
 * Build the Site Editor URL from a site's wp-admin URL.
 */
export function getSiteEditorUrl(
	adminUrl: string,
	{ startWalkthrough = false }: { startWalkthrough?: boolean } = {}
): string {
	const base = adminUrl.endsWith( '/' ) ? adminUrl : `${ adminUrl }/`;
	const url = `${ base }site-editor.php`;

	// `go` tells Big Sky this arrival came from onboarding, so it personalizes the
	// copy instead of waiting to be spoken to. It never re-runs: the flag stays in
	// the editor URL, so a site that has already been personalized has to see it
	// and do nothing. `reset` is the way to run it again.
	//
	// `canvas=edit` is load-bearing: Big Sky's assembler only mounts on the
	// editing canvas (useShouldLoadBigSky requires canvasMode === 'edit'), and a
	// plain site-editor.php load stays in view mode — the kickoff, the copy mask,
	// and the walkthrough all silently never run without it. The welcome-guide
	// overlay this parameter was once blamed for came from sites where Big Sky
	// had not been enabled by hand-off time (the enable race fixed on the wpcom
	// side); when Big Sky mounts, it suppresses the guide itself.
	//
	// Only set when the spec applied; there is nothing to personalize from
	// otherwise.
	const editorUrl = startWalkthrough
		? addQueryArgs( url, { 'blueprint-walkthrough': 'go', canvas: 'edit' } )
		: url;

	return withJetpackSso( editorUrl );
}

/**
 * Route an Atomic wp-admin URL through Jetpack SSO so the customer arrives
 * logged in.
 *
 * They have a WordPress.com session, not a session on their Atomic site, and
 * those are different things. Sending them straight to wp-admin showed them a
 * login form for a site they had just made — asking them to sign in to
 * something they had not been told was separate. Jetpack SSO trades the session
 * they have for the one they need and forwards them on.
 * @param adminUrl Absolute wp-admin URL to land on.
 * @returns The SSO URL, or the original when it cannot be parsed.
 */
function withJetpackSso( adminUrl: string ): string {
	let target: URL;
	try {
		target = new URL( adminUrl );
	} catch {
		// Not something we can rewrite. Hand back what we were given rather than
		// dropping the customer's redirect entirely.
		return adminUrl;
	}

	// SSO lives on the site's own host. A *.wordpress.com address is the
	// WordPress.com side of an Atomic site rather than the site itself, and
	// logging in there does not produce a session for wp-admin.
	if ( target.hostname.endsWith( '.wordpress.com' ) ) {
		target.hostname = target.hostname.replace( '.wordpress.com', '.wpcomstaging.com' );
	}

	const login = new URL( target.href );
	login.pathname = '/wp-login.php';
	login.search = '';

	// Deliberately NOT `action=jetpack-sso`. Jetpack only saves the
	// `jetpack_sso_redirect_to` cookie — the sole carrier of the destination
	// across the WordPress.com round trip — on the plain login path; a direct
	// `action=jetpack-sso` entry skips save_cookies() and the return leg falls
	// back to admin_url(), landing the customer on /wp-admin with the deep link
	// gone. A plain wp-login.php?redirect_to=… saves the cookie, and wpcomsh
	// auto-forwards Calypso-referred visitors to WordPress.com SSO anyway.
	return addQueryArgs( login.href, {
		// Relative, so the redirect cannot be pointed off-site.
		redirect_to: `${ target.pathname }${ target.search }`,
	} );
}

export function logBlueprintArchiveEvent(
	type: string,
	properties: Record< string, unknown > = {},
	blogId?: number
): void {
	void logToLogstash( {
		feature: 'calypso_client',
		message: 'Blueprint archive import onboarding',
		severity: 'debug',
		...( blogId ? { blog_id: blogId } : {} ),
		properties: {
			type: `blueprint_archive_import_${ type }`,
			...properties,
		},
	} ).catch( () => {} );
}
