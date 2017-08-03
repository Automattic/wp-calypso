/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import PluginsLog from 'lib/plugins/log-store';
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle';
import PluginUpdateIndicator from 'my-sites/plugins/plugin-site-update-indicator';
import PluginInstallButton from 'my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'my-sites/plugins/plugin-remove-button';
import PluginSiteDisabledManage from 'my-sites/plugins/plugin-site-disabled-manage';
import Site from 'blocks/site';

const PluginSiteJetpack = React.createClass( {
	propTypes: {
		site: React.PropTypes.object,
		plugin: React.PropTypes.object,
		notices: React.PropTypes.object,
		allowedActions: React.PropTypes.shape( {
			activation: React.PropTypes.bool,
			autoupdate: React.PropTypes.bool,
			remove: React.PropTypes.bool,
		} ),
		isAutoManaged: React.PropTypes.bool,
	},

	getDefaultProps: function() {
		return {
			allowedActions: {
				activation: true,
				autoupdate: true,
				remove: true,
			},
			isAutoManaged: false,
		};
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
		const {
			activation: canToggleActivation,
			autoupdate: canToggleAutoupdate,
			remove: canToggleRemove,
		} = this.props.allowedActions;

		const showAutoManagedMessage = this.props.isAutoManaged;

		return (
			<FoldableCard compact
				clickableHeader
				className="plugin-site-jetpack"
				header={ <Site site={ this.props.site } indicator={ false } /> }
				summary={ <PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } notices={ this.props.notices } expanded={ false } /> }
				expandedSummary={ <PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } notices={ this.props.notices } expanded={ true } /> }
				>
				<div>
					{ canToggleActivation && <PluginActivateToggle
						site={ this.props.site }
						plugin={ this.props.site.plugin }
						notices={ this.props.notices } /> }
					{ canToggleAutoupdate && <PluginAutoupdateToggle
						site={ this.props.site }
						plugin={ this.props.site.plugin }
						notices={ this.props.notices }
						wporg={ true } /> }
					{ canToggleRemove && <PluginRemoveButton
						plugin={ this.props.site.plugin }
						site={ this.props.site }
						notices={ this.props.notices } /> }

					{ showAutoManagedMessage &&
						<div className="plugin-site-jetpack__automanage-notice">
						{ this.props.translate( '%(pluginName)s is automatically managed on this site',
							{ args: { pluginName: this.props.plugin.name } } )
						}
						</div>
					}

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

export default localize( PluginSiteJetpack );
