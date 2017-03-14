/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormSecurity from 'my-sites/site-settings/form-security';
import JetpackMonitor from 'my-sites/site-settings/form-jetpack-monitor';
import JetpackManageErrorPage from 'my-sites/jetpack-manage-error-page';

const SiteSettingsSecurity = ( { site, translate } ) => {
	if ( ! site.jetpack ) {
		return (
			<JetpackManageErrorPage
				action={ translate( 'Manage general settings for %(site)s', { args: { site: site.name } } ) }
				actionURL={ '/settings/general/' + site.slug }
				title={ translate( 'No security configuration is required.' ) }
				line={ translate( 'Security management is automatic for WordPress.com sites.' ) }
				illustration="/calypso/images/drake/drake-jetpack.svg"
			/>
		);
	}

	if ( ! site.canManage() ) {
		return (
			<JetpackManageErrorPage
				template="optInManage"
				title= { translate( 'Looking to manage this site\'s security settings?' ) }
				section="security-settings"
				siteId={ site.ID }
			/>
		);
	}

	if ( ! site.versionCompare( '3.4', '>=' ) ) {
		return (
			<JetpackManageErrorPage
				template="updateJetpack"
				siteId={ site.ID }
				version="3.4"
			/>
		);
	}

	return (
		<div>
			<JetpackMonitor site={ site } />
			<FormSecurity />
		</div>
	);
};

export default localize( SiteSettingsSecurity );
