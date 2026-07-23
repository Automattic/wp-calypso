import { addQueryArgs } from '@wordpress/url';
import { logToLogstash } from 'calypso/lib/logstash';
import wpcom from 'calypso/lib/wp';

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
