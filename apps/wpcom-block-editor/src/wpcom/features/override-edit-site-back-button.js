import { __experimentalNavigationBackButton as NavigationBackButton } from '@wordpress/components';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import { registerPlugin } from '@wordpress/plugins';
/**
 * Conditional dependency.  We cannot use the standard 'import' since this package is
 * not available in the post editor and causes WSOD in that case.  Instead, we can
 * define it from 'require' and conditionally check if it is available for use.
 */
const editSitePackage = require( '@wordpress/edit-site' );

/**
 * Ensures that the site editor's back to dashboard button always leads back to Calypso from
 * both wp-admin and the calypso iframe.
 */
function overrideBackToDashboardButton() {
	if ( ! editSitePackage?.__experimentalMainDashboardButton ) {
		return;
	}

	const SiteEditorDashboardFill = editSitePackage.__experimentalMainDashboardButton;
	const siteSlug = window.location.hostname;

	registerPlugin( 'a8c-wpcom-block-editor-site-editor-back-to-dashboard-override', {
		render: function SiteEditorCloseFill() {
			return (
				<SiteEditorDashboardFill>
					<NavigationBackButton
						backButtonLabel={ __( 'Dashboard' ) }
						// eslint-disable-next-line wpcalypso/jsx-classname-namespace
						className="edit-site-navigation-panel__back-to-dashboard"
						href={ `https://wordpress.com/home/${ siteSlug }` }
					/>
				</SiteEditorDashboardFill>
			);
		},
	} );
}

domReady( overrideBackToDashboardButton );
