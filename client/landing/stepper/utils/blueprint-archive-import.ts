import { addQueryArgs } from '@wordpress/url';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { transferStates, TransferStates } from 'calypso/state/automated-transfer/constants';

export const BLUEPRINT_ARCHIVE_IMPORT_QUERY_VALUE = '1';

// Reuse the flow that already hosts the AI site-spec step.
const BLUEPRINT_ARCHIVE_SITE_SPEC_PATH = '/setup/ai-site-builder-spec/site-spec';

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
}: {
	siteSlug?: string | null;
	siteId?: string | number | null;
	blueprintSlug: string;
	ref?: string | null;
	source?: string | null;
} ): string {
	return addQueryArgs( BLUEPRINT_ARCHIVE_SITE_SPEC_PATH, {
		blueprint_archive_import: BLUEPRINT_ARCHIVE_IMPORT_QUERY_VALUE,
		blueprint_slug: blueprintSlug,
		...( siteSlug ? { siteSlug } : {} ),
		...( siteId && String( siteId ) !== '0' ? { siteId } : {} ),
		...( ref ? { ref } : {} ),
		...( source ? { source } : {} ),
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
 * Apply the confirmed site spec on top of the already-imported blueprint site:
 * writes the user's site title/tagline synchronously, stamps blueprint
 * provenance, and materializes the spec into the site knowledge store. Runs
 * after the import completes and before the redirect. Non-destructive.
 */
export async function applyBlueprintSpec(
	siteIdentifier: string,
	specId: string,
	blueprintSlug: string
): Promise< unknown > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdentifier }/big-sky/apply-blueprint-spec`,
			apiNamespace: 'wpcom/v2',
		},
		{ spec_id: specId, blueprint_id: blueprintSlug }
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
 * Poll the site's template-parts REST endpoint until the theme's `header`
 * template part is served, so we only redirect into the Site Editor once the
 * freshly-transferred Atomic site can actually render it. Without this, the
 * editor's first load can race the import (theme/template parts not yet
 * queryable) and the header block renders as an error until a manual reload.
 *
 * Resolves on ready OR on timeout — a timeout must not block handing the user
 * off to their site (a manual reload still recovers).
 */
export async function waitForSiteEditorReady(
	siteIdentifier: string,
	{ totalTimeoutSeconds = 60, pollIntervalMs = 3000 } = {}
): Promise< void > {
	const deadline = Date.now() + totalTimeoutSeconds * 1000;

	while ( Date.now() < deadline ) {
		try {
			const parts = ( await wpcom.req.get( {
				path: `/sites/${ siteIdentifier }/template-parts`,
				apiNamespace: 'wp/v2',
			} ) ) as Array< { slug?: string; area?: string } >;

			if (
				Array.isArray( parts ) &&
				parts.some( ( part ) => part?.slug === 'header' || part?.area === 'header' )
			) {
				return;
			}
		} catch {
			// Site not ready to serve template parts yet — keep polling.
		}

		await wait( pollIntervalMs );
	}

	// Timed out: redirect anyway rather than stranding the user.
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
export function getSiteEditorUrl( adminUrl: string ): string {
	const base = adminUrl.endsWith( '/' ) ? adminUrl : `${ adminUrl }/`;
	return `${ base }site-editor.php`;
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
