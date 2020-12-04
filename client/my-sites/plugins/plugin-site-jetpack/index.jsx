/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginUpdateIndicator from 'calypso/my-sites/plugins/plugin-site-update-indicator';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import Site from 'calypso/blocks/site';
import { Button } from '@automattic/components';
import {
	getPluginOnSite,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class PluginSiteJetpack extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		plugin: PropTypes.object,
		allowedActions: PropTypes.shape( {
			activation: PropTypes.bool,
			autoupdate: PropTypes.bool,
			remove: PropTypes.bool,
		} ),
		isAutoManaged: PropTypes.bool,
	};

	static defaultProps = {
		allowedActions: {
			activation: true,
			autoupdate: true,
			remove: true,
		},
		isAutoManaged: false,
	};

	renderInstallButton = () => {
		return (
			<PluginInstallButton
				isEmbed
				selectedSite={ this.props.site }
				plugin={ this.props.plugin }
				isInstalling={ this.props.installInProgress }
			/>
		);
	};

	renderInstallPlugin = () => {
		return (
			<FoldableCard
				compact
				className="plugin-site-jetpack"
				header={ <Site site={ this.props.site } indicator={ false } /> }
				actionButton={ this.renderInstallButton() }
			/>
		);
	};

	renderPluginSite = () => {
		const {
			activation: canToggleActivation,
			autoupdate: canToggleAutoupdate,
			remove: canToggleRemove,
		} = this.props.allowedActions;

		const showAutoManagedMessage = this.props.isAutoManaged;

		const settingsLink = this.props?.pluginOnSite?.action_links?.Settings ?? null;

		return (
			<FoldableCard
				compact
				clickableHeader
				className="plugin-site-jetpack"
				header={ <Site site={ this.props.site } indicator={ false } /> }
				summary={
					<PluginUpdateIndicator
						site={ this.props.site }
						plugin={ this.props.plugin }
						expanded={ false }
					/>
				}
				expandedSummary={
					<PluginUpdateIndicator site={ this.props.site } plugin={ this.props.plugin } expanded />
				}
			>
				<div>
					{ canToggleActivation && (
						<PluginActivateToggle site={ this.props.site } plugin={ this.props.pluginOnSite } />
					) }
					{ canToggleAutoupdate && (
						<PluginAutoupdateToggle
							site={ this.props.site }
							plugin={ this.props.pluginOnSite }
							wporg
						/>
					) }
					{ canToggleRemove && (
						<PluginRemoveButton plugin={ this.props.pluginOnSite } site={ this.props.site } />
					) }
					{ settingsLink && (
						<Button compact href={ settingsLink }>
							{ this.props.translate( `Settings` ) }
						</Button>
					) }
					{ showAutoManagedMessage && (
						<div className="plugin-site-jetpack__automanage-notice">
							{ this.props.translate( 'Auto-managed on this site' ) }
						</div>
					) }
				</div>
			</FoldableCard>
		);
	};

	render() {
		if ( ! this.props.site || ! this.props.plugin ) {
			return null;
		}

		if ( ! this.props.pluginOnSite ) {
			return this.renderInstallPlugin();
		}

		return this.renderPluginSite();
	}
}

export default connect( ( state, { site, plugin } ) => ( {
	pluginOnSite: getPluginOnSite( state, site.ID, plugin.slug ),
	installInProgress: isPluginActionInProgress( state, site.ID, plugin.id, 'INSTALL_PLUGIN' ),
} ) )( localize( PluginSiteJetpack ) );
