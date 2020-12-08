/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

const DEFAULT_SITE_NAME = __( 'Site Title', __i18n_text_domain__ );

// When `exact === false', the check is more relaxed — chances are that if the title
// matches (even it not exactly) the default title, the user would like want
// to change it before launch.
export const isDefaultSiteTitle = ( {
	currentSiteTitle = '',
	exact = false,
}: {
	currentSiteTitle: string;
	exact?: boolean;
} ): boolean =>
	exact
		? currentSiteTitle === DEFAULT_SITE_NAME
		: new RegExp( DEFAULT_SITE_NAME, 'i' ).test( currentSiteTitle );
