/**
 * External dependencies
 */
var React = require( 'react' ),
	config = require( 'config' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var JetpackProtect = require( 'my-sites/site-settings/form-jetpack-protect' ),
	JetpackMonitor = require( 'my-sites/site-settings/form-jetpack-monitor' ),
	JetpackScan = require( 'my-sites/site-settings/form-jetpack-scan' ),
	JetpackManageErrorPage = require( 'my-sites/jetpack-manage-error-page' );

module.exports = React.createClass( {
	displayName: 'SiteSettingsSecurity',

	componentWillMount: function() {
		debug( 'Mounting SiteSettingsSecurity React component.' );
	},

	render: function() {
		var site = this.props.site;

		if ( ! site.jetpack ) {
			return (
				<JetpackManageErrorPage
					action={ this.translate( 'Manage general settings for %(site)s', { args: { site: site.name } } ) }
					actionURL={ '/settings/general/' + site.slug }
					title={ this.translate( 'No security configuration is required.' ) }
					line={ this.translate( 'Security management is automatic for WordPress.com sites.' ) }
					illustration="/calypso/images/drake/drake-jetpack.svg"
				/>
			);
		}

		if ( ! site.canManage() ) {
			return (
				<JetpackManageErrorPage
					template="optInManage"
					title= { this.translate( 'Looking to manage this site\'s security settings?' ) }
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
				<JetpackProtect site={ site } />
				{ config.isEnabled( 'settings/security/scan' ) && <JetpackScan site={ site } /> }
				<JetpackMonitor site={ site } />
			</div>
		);
	}
} );
