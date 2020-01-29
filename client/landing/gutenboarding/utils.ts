/**
 * External dependencies
 */
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import { parse as parseURL } from 'url';
import { SiteVertical } from './stores/onboard/types';
import { DomainName } from '@automattic/data-stores/types/domain-suggestions';

interface CreateSite {
	siteTitle: string | undefined;
	siteUrl: DomainName | undefined;
	theme: string | undefined;
	siteVertical: SiteVertical | undefined;
}

export function createSite( { siteTitle, siteUrl, theme, siteVertical }: CreateSite ) {
	const newSiteParams = {
		blog_name: siteUrl,
		blog_title: siteTitle,
		options: {
			theme: `pub/${ theme }`,
			site_vertical: siteVertical?.id,
			site_vertical_name: siteVertical?.label,
			site_information: {
				title: siteTitle,
			},
		},
		public: -1,
		validate: false,
		find_available_url: true,
	};
	wpcom.undocumented().sitesNew( newSiteParams, function( error, response ) {
		if ( error ) {
			throw new Error( error );
		}

		const parsedBlogURL = parseURL( response.blog_details.url );

		const siteSlug = parsedBlogURL.hostname;
		window.location.href = `/block-editor/page/${ siteSlug }/home?is-gutenboarding`;
	} );
}
