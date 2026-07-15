import { addQueryArgs } from '@wordpress/url';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { pollUntil, PollTimeoutError } from './poll-until';

export const BUILD_WOW_QUERY_VALUE = '1';
const BUILD_WOW_SITE_SPEC_PATH = '/setup/ai-site-builder-spec/site-spec';

// Blog sticker the backend adds once the build-wow site is fully built and ready
// for the Site Editor. Calypso waits for this sticker before redirecting.
export const BUILD_WOW_READY_STICKER = 'big_sky_wow_site_ready';

type BuildWowAtomicState = {
	is_atomic?: boolean;
	is_transfer_active?: boolean;
	ready_for_editor?: boolean;
};

export type BuildWowResponse = {
	success?: boolean;
	blog_id?: number;
	site_editor_url?: string;
	atomic?: BuildWowAtomicState;
	remote_option_ready?: boolean;
	build?: {
		status?: string;
	};
};

export function isBuildWowEnabled(
	queryParams: URLSearchParams,
	isAutomattician = false
): boolean {
	return isAutomattician && queryParams.get( 'build_wow' ) === BUILD_WOW_QUERY_VALUE;
}

export function getBuildWowSiteIdentifier( {
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

export function getBuildWowSiteSpecUrl( {
	siteSlug,
	siteId,
	ref,
	source,
}: {
	siteSlug?: string | null;
	siteId?: string | number | null;
	ref?: string | null;
	source?: string | null;
} ): string {
	return addQueryArgs( BUILD_WOW_SITE_SPEC_PATH, {
		build_wow: BUILD_WOW_QUERY_VALUE,
		...( siteSlug ? { siteSlug } : {} ),
		...( siteId && String( siteId ) !== '0' ? { siteId } : {} ),
		...( ref ? { ref } : {} ),
		...( source ? { source } : {} ),
	} );
}

export async function requestBuildWowSite(
	siteIdentifier: string,
	specId?: string
): Promise< BuildWowResponse > {
	return wpcom.req.post(
		{
			path: `/sites/${ siteIdentifier }/big-sky/build-wow`,
			apiNamespace: 'wpcom/v2',
		},
		specId ? { spec_id: specId } : {}
	);
}

export async function waitForBuildWowSiteEditorReady(
	siteIdentifier: string,
	{ totalTimeoutSeconds = 300, pollIntervalMs = 3000 } = {}
): Promise< void > {
	let lastStickers: string[] | undefined;
	let lastError: string | undefined;

	try {
		await pollUntil(
			async () => {
				lastError = undefined;
				try {
					const stickers = ( await wpcom.req.get( {
						path: `/sites/${ siteIdentifier }/blog-stickers`,
						apiVersion: '1.1',
					} ) ) as string[];
					lastStickers = Array.isArray( stickers ) ? stickers : undefined;

					return lastStickers?.includes( BUILD_WOW_READY_STICKER ) ? true : undefined;
				} catch ( error ) {
					lastError = error instanceof Error ? error.message : String( error );
					return undefined;
				}
			},
			{
				maxAttempts: Math.ceil( ( totalTimeoutSeconds * 1000 ) / pollIntervalMs ),
				intervalMs: pollIntervalMs,
				initialDelayMs: 0,
			}
		);
	} catch ( error ) {
		if ( error instanceof PollTimeoutError ) {
			throw new Error(
				`Timed out waiting for the ${ BUILD_WOW_READY_STICKER } blog sticker. Last stickers: ${
					lastStickers ? lastStickers.join( ', ' ) || 'none' : 'unknown'
				}, error=${ lastError ?? 'none' }.`
			);
		}
		throw error;
	}
}

export function logBuildWowEvent(
	type: string,
	properties: Record< string, unknown > = {},
	blogId?: number
): void {
	void logToLogstash( {
		feature: 'calypso_client',
		message: 'Build with AI on WPCOM Atomic',
		severity: 'debug',
		...( blogId ? { blog_id: blogId } : {} ),
		properties: {
			type: `build_wow_${ type }`,
			...properties,
		},
	} ).catch( () => {} );
}
