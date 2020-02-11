/**
 * Internal dependencies
 */
import { SiteVertical } from './stores/onboard/types';

/**
 * ⚠️😱 Calypso dependencies 😱⚠️
 */
import { untrailingslashit } from '../../lib/route';
import { urlToSlug } from '../../lib/url';

interface CreateSiteData {
	siteTitle?: string;
	siteUrl?: string;
	theme?: string;
	siteVertical: SiteVertical | undefined;
}

export const getSiteCreationParams = ( {
	siteTitle,
	siteUrl,
	theme,
	siteVertical,
}: CreateSiteData ) => ( {
	blog_name: siteUrl?.split( '.wordpress' )[ 0 ],
	blog_title: siteTitle,
	options: {
		theme: `pub/${ theme }`,
		site_vertical: siteVertical?.id,
		site_vertical_name: siteVertical?.label,
		site_information: {
			title: siteTitle,
		},
		site_creation_flow: 'gutenboarding',
	},
} );

export const getSiteSlug = ( url: string ) => urlToSlug( untrailingslashit( url ) );
