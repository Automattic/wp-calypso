import type { Site } from '../data/types';

export function isSelfHostedJetpackConnected( site: Site ) {
	return site.jetpack_connection && ! site.is_wpcom_atomic;
}

export function isP2( site: Site ) {
	return !! site.options?.p2_hub_blog_id || site.options?.is_wpforteams_site;
}
