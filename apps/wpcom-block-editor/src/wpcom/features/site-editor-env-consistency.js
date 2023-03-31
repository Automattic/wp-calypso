import { getCaplysoUrl } from '@automattic/calypso-url';
import { select, dispatch } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';

/**
 * Make the Site Editor's navigation consistent with the
 * Calypso environment it's running in.
 */
function makeSiteEditorNavConsistent() {
	const siteEditor = select( 'core/edit-site' );
	// Not in the Site Editor? Bail.
	if ( ! siteEditor ) {
		return;
	}
	// Don't have to change the origin? Bail.
	if ( getCaplysoUrl() === 'https://wordpress.com' ) {
		return;
	}

	const backButtonUrl = siteEditor.getSettings().__experimentalDashboardLink;
	const envRespectingBackButtonUrl = backButtonUrl.replace(
		/^https:\/\/wordpress.com/,
		getCaplysoUrl()
	);
	dispatch( 'core/edit-site' ).updateSettings( {
		__experimentalDashboardLink: envRespectingBackButtonUrl,
	} );
}
domReady( makeSiteEditorNavConsistent );
