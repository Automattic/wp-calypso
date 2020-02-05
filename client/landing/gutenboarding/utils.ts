/**
 * ***Do not reproduce this pattern for Gutenboarding work.***
 *
 * FIXME: Replace this with another pattern:
 *   - Side-effect (control) of dispatched action?
 */

/**
 * Internal dependencies
 */
import { SiteVertical } from './stores/onboard/types';

/**
 * ⚠️😱 Calypso dependencies 😱⚠️
 */
import wpcom from '../../lib/wp';
import { untrailingslashit } from '../../lib/route';
import { urlToSlug } from '../../lib/url';

interface CreateSite {
	siteTitle?: string;
	siteUrl?: string;
	theme?: string;
	siteVertical: SiteVertical | undefined;
	onCreate: () => void;
}

export function createSite( { siteTitle, siteUrl, theme, siteVertical, onCreate }: CreateSite ) {
	const newSiteParams = {
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
		public: -1,
		validate: false,
		find_available_url: true,
	};

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	wpcom.undocumented().sitesNew( newSiteParams, function( error: any, response: any ) {
		if ( error ) {
			throw new Error( error );
		}

		const url = response?.blog_details?.url;
		if ( ! url ) {
			throw new Error( 'No url in response!' );
		}

		const siteSlug = urlToSlug( untrailingslashit( url ) );
		onCreate();
		window.location.href = `/block-editor/page/${ siteSlug }/home?is-gutenboarding`;
	} );
}
