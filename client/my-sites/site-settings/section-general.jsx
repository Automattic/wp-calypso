/**
 * External dependencies
 */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:site-settings' );

/**
 * Internal dependencies
 */
var GeneralForm = require( 'my-sites/site-settings/form-general' ),
	DeleteSiteOptions = require( './delete-site-options' ),
	config = require( 'config' );

module.exports = React.createClass({
	displayName: 'SiteSettingsGeneral',

	componentWillMount: function() {
		debug( 'Mounting SiteSettingsGeneral React component.' );
	},

	render: function() {
		var site = this.props.site;
		return (
			<div className="general-settings">
				<GeneralForm site={ site } />
				{ ( config.isEnabled( 'manage/site-settings/delete-site' ) && ! site.jetpack && ! site.is_vip ) ?
				<DeleteSiteOptions
					site={ this.props.site }
					sitePurchases={ this.props.sitePurchases }
					hasLoadedSitePurchasesFromServer={ this.props.hasLoadedSitePurchasesFromServer } />
				: null }
			</div>
		);

	}
});
