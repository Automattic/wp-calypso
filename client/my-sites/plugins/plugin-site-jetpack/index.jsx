/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var FoldableCard = require( 'components/foldable-card' ),
	PluginsLog = require( 'lib/plugins/log-store' ),
	PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' ),
	PluginAutoupdateToggle = require( 'my-sites/plugins/plugin-autoupdate-toggle' ),
	PluginUpdateIndicator = require( 'my-sites/plugins/plugin-site-update-indicator' ),
	PluginInstallButton = require( 'my-sites/plugins/plugin-install-button' ),
	PluginRemoveButton = require( 'my-sites/plugins/plugin-remove-button' ),
	PluginSiteDisabledManage = require( 'my-sites/plugins/plugin-site-disabled-manage' ),
	Site = require( 'blocks/site' );

module.exports = React.createClass( {

	displayName: 'PluginSiteJetpack',

	propTypes: {
		site: React.PropTypes.object,
		plugin: React.PropTypes.object,
		notices: React.PropTypes.object,
	},

	renderInstallButton: function() {
		var installInProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, 'INSTALL_PLUGIN' );

		return <PluginInstallButton
			isEmbed={ true }
			notices={ this.props.notices }
			selectedSite={ this.props.site }
			plugin={ this.props.plugin }
			isInstalling={ installInProgress } />;
	},

	renderInstallPlugin: function() {
		return (
			<FoldableCard
				compact
				className="plugin-site-jetpack"
				header={ <Site site={ this.props.site } indicator={ false } /> }
				actionButton={ this.renderInstallButton() } >
			</FoldableCard>
		);
	},

	renderPluginSite: function() {
		return (
			<FoldableCard compact
				clickableHeader
				className="plugin-site-jetpack"
				header={ <Site site={ this.props.site } indicator={ false } /> }
				summary={ <PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } notices={ this.props.notices } expanded={ false } /> }
				expandedSummary={ <PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } notices={ this.props.notices } expanded={ true } /> }
				>
				<div>
					<PluginActivateToggle site={ this.props.site } plugin={ this.props.site.plugin } notices={ this.props.notices } />
					<PluginAutoupdateToggle site={ this.props.site } plugin={ this.props.site.plugin } notices={ this.props.notices } wporg={ true } />
					<PluginRemoveButton plugin={ this.props.site.plugin } site={ this.props.site } notices={ this.props.notices } />
				</div>
			</FoldableCard>
		);
	},

	renderManageWarning: function() {
		return (
			<FoldableCard
				compact
				className="plugin-site-jetpack has-manage-error"
				header={ <Site site={ this.props.site } indicator={ false } /> }
				actionButton={ <PluginSiteDisabledManage site={ this.props.site } plugin={ this.props.plugin } /> } />
		);
	},

	render: function() {
		if ( ! this.props.site || ! this.props.plugin ) {
			return null;
		}

		if ( ! this.props.site.canManage() ) {
			return this.renderManageWarning();
		}

		if ( ! this.props.site.plugin ) {
			return this.renderInstallPlugin();
		}

		return this.renderPluginSite();
	}
} );
