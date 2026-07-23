import { addQueryArgs } from '@wordpress/url';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';
import { pollUntil, PollTimeoutError } from './poll-until';

export const BUILD_WOW_QUERY_VALUE = '1';
const BUILD_WOW_SITE_SPEC_PATH = '/setup/ai-site-builder-spec/site-spec';

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

type SiteResponse = {
	is_wpcom_atomic?: boolean;
	options?: {
		is_wpcom_atomic?: boolean;
	};
};

type BigSkyPluginStatus = {
	remote_option_ready?: boolean;
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

export function isBuildWowSiteEditorReady( response: BuildWowResponse ): boolean {
	return (
		response.atomic?.ready_for_editor === true ||
		( response.atomic?.is_atomic === true && response.remote_option_ready !== false )
	);
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
	let lastIsAtomic: boolean | undefined;
	let lastRemoteOptionReady: boolean | undefined;
	let lastError: string | undefined;

	try {
		await pollUntil(
			async () => {
				lastError = undefined;
				try {
					const site = ( await wpcom.req.get(
						{
							path: `/sites/${ siteIdentifier }`,
							apiVersion: '1.1',
						},
						{
							fields: 'ID,URL,slug,is_wpcom_atomic,options',
							options: 'is_wpcom_atomic',
						}
					) ) as SiteResponse;
					lastIsAtomic = site?.is_wpcom_atomic || site?.options?.is_wpcom_atomic;

					if ( ! lastIsAtomic ) {
						return undefined;
					}

					const status = ( await wpcom.req.get( {
						path: `/sites/${ siteIdentifier }/big-sky-plugin`,
						apiVersion: '1.1',
					} ) ) as BigSkyPluginStatus;
					lastRemoteOptionReady = status.remote_option_ready;

					return status.remote_option_ready !== false ? true : undefined;
				} catch ( error ) {
					lastError = error instanceof Error ? error.message : String( error );
					return undefined;
				}
			},
			{
				maxAttempts: Math.ceil( ( totalTimeoutSeconds * 1000 ) / pollIntervalMs ),
				intervalMs: pollIntervalMs,
				initialDelayMs: pollIntervalMs,
			}
		);
	} catch ( error ) {
		if ( error instanceof PollTimeoutError ) {
			throw new Error(
				`Timed out waiting for build-wow site editor readiness. Last state: is_atomic=${ String(
					lastIsAtomic
				) }, remote_option_ready=${ String( lastRemoteOptionReady ) }, error=${
					lastError ?? 'none'
				}.`
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
