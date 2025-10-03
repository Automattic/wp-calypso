import type { Site } from '@automattic/api-core';

export function isSelfHostedJetpackConnected( site: Site ) {
	return site.jetpack_connection && ! site.is_wpcom_atomic;
}

export function isP2( site: Site ) {
	return !! site.options?.p2_hub_blog_id || site.options?.is_wpforteams_site;
}

export function isSimple( site: Site ) {
	return ! site.jetpack && ! site.is_wpcom_atomic;
}

export function isStagingSite( site: Site ) {
	return site.is_wpcom_staging_site;
}
