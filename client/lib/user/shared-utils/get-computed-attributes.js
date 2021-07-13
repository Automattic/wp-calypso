/**
 * Internal dependencies
 */
import { getLanguage } from 'calypso/lib/i18n-utils/utils';
import { withoutHttp } from 'calypso/lib/url';

function getSiteSlug( url ) {
	const slug = withoutHttp( url );
	return slug.replace( /\//g, '::' );
}

export function getComputedAttributes( attributes ) {
	const language = getLanguage( attributes.language );
	const primaryBlogUrl = attributes.primary_blog_url || '';
	return {
		primarySiteSlug: getSiteSlug( primaryBlogUrl ),
		localeSlug: attributes.language,
		localeVariant: attributes.locale_variant,
		isRTL: !! ( language && language.rtl ),
	};
}
