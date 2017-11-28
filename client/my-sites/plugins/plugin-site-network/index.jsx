/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import FoldableCard from 'components/foldable-card';
import CompactCard from 'components/card/compact';
import AllSites from 'my-sites/all-sites';
import PluginsLog from 'lib/plugins/log-store';
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle';
import PluginUpdateIndicator from 'my-sites/plugins/plugin-site-update-indicator';
import PluginInstallButton from 'my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'my-sites/plugins/plugin-remove-button';
import PluginSiteDisabledManage from 'my-sites/plugins/plugin-site-disabled-manage';
import Site from 'blocks/site';

class PluginSiteNetwork extends React.Component {
	static displayName = 'PluginSiteNetwork';

	static propTypes = {
		site: PropTypes.object,
		plugin: PropTypes.object,
		notices: PropTypes.object,
		secondarySites: PropTypes.array,
	};

	renderInstallButton = () => {
		if (
			! ( typeof this.props.site.canManage === 'function'
				? this.props.site.canManage()
				: this.props.site.canManage )
		) {
			return this.renderManageWarning();
		}
		const installInProgress = PluginsLog.isInProgressAction(
			this.props.site.ID,
			this.props.plugin.slug,
			'INSTALL_PLUGIN'
		);

		return (
			<PluginInstallButton
				isEmbed={ true }
				notices={ this.props.notices }
				selectedSite={ this.props.site }
				plugin={ this.props.plugin }
				isInstalling={ installInProgress }
			/>
		);
	};

	renderMultisiteHeader = () => {
		return (
			<div className="plugin-site-network__header">
				<AllSites
					sites={ this.props.secondarySites }
					count={ this.props.secondarySites.length }
					domain={ this.props.site.domain }
					title={ this.props.translate( "%(mainSiteName)s's Network", {
						args: {
							mainSiteName: this.props.site.name,
						},
					} ) }
				/>
			</div>
		);
	};

	renderInstallPlugin = () => {
		return (
			<FoldableCard
				compact
				className="plugin-site-network"
				header={ this.renderMultisiteHeader() }
				actionButton={ this.renderInstallButton() }
			/>
		);
	};

	renderPluginActions = () => {
		if (
			! ( typeof this.props.site.canManage === 'function'
				? this.props.site.canManage()
				: this.props.site.canManage )
		) {
			return this.renderManageWarning();
		}

		return (
			<div className="plugin-site-network__actions">
				<PluginAutoupdateToggle
					site={ this.props.site }
					plugin={ this.props.site.plugin }
					notices={ this.props.notices }
					wporg={ true }
				/>
				<PluginRemoveButton
					plugin={ this.props.site.plugin }
					site={ this.props.site }
					notices={ this.props.notices }
				/>
			</div>
		);
	};

	renderPluginSite = () => {
		return (
			<FoldableCard
				compact
				clickableHeader
				className="plugin-site-network"
				header={ this.renderMultisiteHeader() }
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
					{ this.renderPluginActions() }
					<div className="plugin-site__secondary-sites">
						{ this.props.secondarySites.map( this.renderSecondarySite ) }
					</div>
				</div>
			</FoldableCard>
		);
	};

	renderSecondarySite = site => {
		return (
			<CompactCard
				className="plugin-site-network__secondary-site"
				key={ 'secondary-site-' + site.ID }
			>
				<Site site={ site } indicator={ false } />
				{ this.renderSecondarySiteActions( site ) }
			</CompactCard>
		);
	};

	renderSecondarySiteActions = site => {
		if ( ! ( site.canManage === 'function' ? site.canManage() : site.canManage ) ) {
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
	};

	renderManageWarning = () => {
		return (
			<div className="plugin-site-network__network_disabled">
				<PluginSiteDisabledManage
					site={ this.props.site }
					plugin={ this.props.plugin }
					isNetwork={ true }
				/>
			</div>
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

export default localize( PluginSiteNetwork );
