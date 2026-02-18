import type { Site } from '@automattic/api-core';

export function isSelfHostedJetpackConnected( site: Site ) {
	return (
		site.jetpack_connection && ! site.is_wpcom_atomic && ! site.is_wpcom_flex && ! site.is_garden
	);
}

export function isP2( site: Site ) {
	return !! site.options?.p2_hub_blog_id || site.options?.is_wpforteams_site;
}

export function isSimple( site: Site ) {
	return ! site.jetpack && ! site.is_wpcom_atomic && ! site.is_garden;
}

export function isCommerceGarden( site: Site ) {
	// Include garden_name check alone so deleted sites (which may omit is_garden) are still identified.
	if ( ( site.is_garden && site.garden_name === 'commerce' ) || site.garden_name === 'commerce' ) {
		return true;
	}
	// Deleted sites may omit is_garden and garden_name; use URL/slug as fallback (e.g. *.commerce-garden.com).
	const urlOrSlug = site.URL || site.slug || '';
	return urlOrSlug.includes( 'commerce-garden.com' );
}

export function isStagingSite( site: Site ) {
	return site.is_wpcom_staging_site;
}
