/**
 * External dependencies
 */

import PropTypes from 'prop-types';
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
import Site from 'blocks/site';
import { Button } from '@automattic/components';

/**
 * Style dependencies
 */
import './style.scss';

class PluginSiteJetpack extends React.Component {
	static propTypes = {
		site: PropTypes.object,
		plugin: PropTypes.object,
		notices: PropTypes.object,
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
		const installInProgress = PluginsLog.isInProgressAction(
			this.props.site.ID,
			this.props.plugin.slug,
			'INSTALL_PLUGIN'
		);

		return (
			<PluginInstallButton
				isEmbed={ true }
				selectedSite={ this.props.site }
				plugin={ this.props.plugin }
				isInstalling={ installInProgress }
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

		const settingsLink = this.props?.site?.plugin?.action_links?.Settings ?? null;

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
						notices={ this.props.notices }
						expanded={ false }
					/>
				}
				expandedSummary={
					<PluginUpdateIndicator
						site={ this.props.site }
						plugin={ this.props.plugin }
						notices={ this.props.notices }
						expanded={ true }
					/>
				}
			>
				<div>
					{ canToggleActivation && (
						<PluginActivateToggle site={ this.props.site } plugin={ this.props.site.plugin } />
					) }
					{ canToggleAutoupdate && (
						<PluginAutoupdateToggle
							site={ this.props.site }
							plugin={ this.props.site.plugin }
							wporg={ true }
						/>
					) }
					{ canToggleRemove && (
						<PluginRemoveButton plugin={ this.props.site.plugin } site={ this.props.site } />
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

		if ( ! this.props.site.plugin ) {
			return this.renderInstallPlugin();
		}

		return this.renderPluginSite();
	}
}

export default localize( PluginSiteJetpack );
