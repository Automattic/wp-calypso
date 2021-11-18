import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EllipsisMenu from 'calypso/components/ellipsis-menu';
import PopoverMenuItem from 'calypso/components/popover-menu/item';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import {
	getPluginOnSite,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';

import './style.scss';

class PluginSiteJetpack extends Component {
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
				isEmbed={ true }
				selectedSite={ this.props.site }
				plugin={ this.props.plugin }
				isInstalling={ this.props.installInProgress }
			/>
		);
	};

	renderInstallPlugin = () => {
		return (
			<div className="plugin-site-jetpack__container">
				<div className="plugin-site-jetpack__domain">{ this.props.site.domain }</div>
				<div>{ this.renderInstallButton() }</div>
			</div>
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
			<div className="plugin-site-jetpack__container">
				<div className="plugin-site-jetpack__domain">{ this.props.site.domain }</div>
				{ canToggleActivation && (
					<PluginActivateToggle site={ this.props.site } plugin={ this.props.pluginOnSite } />
				) }
				{ canToggleAutoupdate && (
					<PluginAutoupdateToggle
						site={ this.props.site }
						plugin={ this.props.pluginOnSite }
						wporg={ true }
					/>
				) }
				<div className="plugin-site-jetpack__action plugin-action last-actions">
					{ canToggleRemove && (
						<PluginRemoveButton plugin={ this.props.pluginOnSite } site={ this.props.site } />
					) }
					{ settingsLink && (
						<EllipsisMenu position={ 'bottom' }>
							<PopoverMenuItem href={ settingsLink }>
								{ this.props.translate( 'Settings' ) }
							</PopoverMenuItem>
						</EllipsisMenu>
					) }
					{ showAutoManagedMessage && (
						<div className="plugin-site-jetpack__automanage-notice">
							{ this.props.translate( 'Auto-managed on this site' ) }
						</div>
					) }
				</div>
			</div>
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
	installInProgress: isPluginActionInProgress( state, site.ID, plugin.id, INSTALL_PLUGIN ),
	pluginOnSite: getPluginOnSite( state, site.ID, plugin.slug ),
} ) )( localize( PluginSiteJetpack ) );
