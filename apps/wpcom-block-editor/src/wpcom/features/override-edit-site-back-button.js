import { __experimentalNavigationBackButton as NavigationBackButton } from '@wordpress/components';
import domReady from '@wordpress/dom-ready';
import { createElement } from '@wordpress/element';
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
	if ( ! editSitePackage ) return;

	const SiteEditorDashboardFill = editSitePackage?.__experimentalMainDashboardButton;

	registerPlugin( 'a8c-wpcom-block-editor-site-editor-back-to-dashboard-override', {
		render: function SiteEditorCloseFill() {
			return createElement( SiteEditorDashboardFill, null, [
				createElement( NavigationBackButton, {
					backButtonLabel: __( 'Dashboard' ),
					className: 'edit-site-navigation-panel__back-to-dashboard',
					href: 'helloworld.com', // TODO: Dynamically generate correct close url
				} ),
			] );
		},
	} );
}

domReady( overrideBackToDashboardButton );
