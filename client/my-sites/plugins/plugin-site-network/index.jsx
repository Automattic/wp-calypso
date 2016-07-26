/**
 * External dependencies
 */
var React = require( 'react' );

/**
 * Internal dependencies
 */
var FoldableCard = require( 'components/foldable-card' ),
	CompactCard = require( 'components/card/compact' ),
	AllSites = require( 'my-sites/all-sites' ),
	PluginsLog = require( 'lib/plugins/log-store' ),
	PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' ),
	PluginAutoupdateToggle = require( 'my-sites/plugins/plugin-autoupdate-toggle' ),
	PluginUpdateIndicator = require( 'my-sites/plugins/plugin-site-update-indicator' ),
	PluginInstallButton = require( 'my-sites/plugins/plugin-install-button' ),
	PluginRemoveButton = require( 'my-sites/plugins/plugin-remove-button' ),
	PluginSiteDisabledManage = require( 'my-sites/plugins/plugin-site-disabled-manage' ),
	Site = require( 'blocks/site' );

module.exports = React.createClass( {

	displayName: 'PluginSiteNetwork',

	propTypes: {
		site: React.PropTypes.object,
		plugin: React.PropTypes.object,
		notices: React.PropTypes.object,
		secondarySites: React.PropTypes.array,
	},

	renderInstallButton: function() {
		if ( ! this.props.site.canManage() ) {
			return this.renderManageWarning();
		}
		const installInProgress = PluginsLog.isInProgressAction( this.props.site.ID, this.props.plugin.slug, 'INSTALL_PLUGIN' );

		return <PluginInstallButton
			isEmbed={ true }
			notices={ this.props.notices }
			selectedSite={ this.props.site }
			plugin={ this.props.plugin }
			isInstalling={ installInProgress } />;
	},

	renderMultisiteHeader: function() {
		return (
			<div className="plugin-site-network__header">
				<AllSites
					sites={ this.props.secondarySites }
					count={ this.props.secondarySites.length }
					domain={ this.props.site.domain }
					title={ this.translate( '%(mainSiteName)s\'s Network', {
						args: {
							mainSiteName: this.props.site.name
						},
					} ) }
				/>
			</div>
		);
	},

	renderInstallPlugin: function() {
		return (
			<FoldableCard compact
				className="plugin-site-network"
				header={ this.renderMultisiteHeader() }
				actionButton={ this.renderInstallButton() } >
			</FoldableCard>
		);
	},

	renderPluginActions: function() {
		if ( ! this.props.site.canManage() ) {
			return this.renderManageWarning();
		}

		return (
			<div className="plugin-site-network__actions">
				<PluginAutoupdateToggle site={ this.props.site } plugin={ this.props.site.plugin } notices={ this.props.notices } wporg={ true } />
				<PluginRemoveButton plugin={ this.props.site.plugin } site={ this.props.site } notices={ this.props.notices } />
			</div>
		);
	},

	renderPluginSite: function() {
		return (
			<FoldableCard compact clickableHeader
				className="plugin-site-network"
				header={ this.renderMultisiteHeader() }
				summary={ <PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } notices={ this.props.notices } expanded={ false }/> }
				expandedSummary={ <PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } notices={ this.props.notices } expanded={ true }/> }
				>
				<div>
					{ this.renderPluginActions() }
					<div className="plugin-site__secondary-sites">
						{ this.props.secondarySites.map( this.renderSecondarySite ) }
					</div>

				</div>

			</FoldableCard>
		);
	},

	renderSecondarySite: function( site ) {
		return (
			<CompactCard className="plugin-site-network__secondary-site" key={ 'secondary-site-' + site.ID }>
				<Site site={ site } indicator={ false } />
				{ this.renderSecondarySiteActions( site ) }
			</CompactCard>
		);
	},

	renderSecondarySiteActions: function( site ) {
		if ( ! site.canManage() ) {
			return (
				<div className="plugin-site-network__secondary-site-actions">
					<PluginSiteDisabledManage site={ site } plugin={ site.plugin } />
				</div>
			);
		}
		return (
			<div className="plugin-site-network__secondary-site-actions">
				<PluginActivateToggle site={ site } plugin={ site.plugin } notices={ this.props.notices } />
			</div>
		);
	},

	renderManageWarning: function() {
		return (
			<div className="plugin-site-network__network_disabled">
				<PluginSiteDisabledManage site={ this.props.site } plugin={ this.props.plugin } isNetwork={ true } />
			</div>
		);
	},

	render: function() {
		if ( ! this.props.site || ! this.props.plugin ) {
			return null;
		}

		if ( ! this.props.site.plugin ) {
			return this.renderInstallPlugin();
		}

		return this.renderPluginSite();
	}
} );
