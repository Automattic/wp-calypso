import { getCalypsoUrl } from '@automattic/calypso-url';
import { select, dispatch } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';

/**
 * Extend the Back link on the theme preview.
 */
function themePreviewBackLink() {
	const siteEditor = select( 'core/edit-site' );

	if ( ! siteEditor ) {
		return;
	}

	const siteSlug = window.location.hostname;
	const backButtonUrl = getCalypsoUrl( `/themes/${ siteSlug }` );

	// It's not well typed. @see https://github.com/WordPress/gutenberg/issues/34190
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	( dispatch( 'core/edit-site' ) as any ).updateSettings( {
		__experimentalThemePreviewBackLink: backButtonUrl,
	} );
}
domReady( themePreviewBackLink );
