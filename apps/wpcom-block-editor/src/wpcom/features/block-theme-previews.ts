import { getCalypsoUrl, isAllowedOrigin } from '@automattic/calypso-url';
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
	let backButtonUrl = getCalypsoUrl( `/themes/${ siteSlug }` );
	try {
		// Users come from the Theme Showcase page or the Theme Detail page.
		const referrer = new URL( window.document.referrer );
		if ( isAllowedOrigin( referrer.origin ) ) {
			backButtonUrl = getCalypsoUrl( referrer.pathname );
		}
	} catch ( e ) {
		// leave backButtonUrl as default
	}
	// It's not well typed. @see https://github.com/WordPress/gutenberg/issues/34190
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	( dispatch( 'core/edit-site' ) as any ).updateSettings( {
		__experimentalThemePreviewBackLink: backButtonUrl,
	} );
}
domReady( themePreviewBackLink );
