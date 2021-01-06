/**
 * External dependencies
 */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FoldableCard from 'calypso/components/foldable-card';
import { CompactCard } from '@automattic/components';
import AllSites from 'calypso/blocks/all-sites';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import PluginUpdateIndicator from 'calypso/my-sites/plugins/plugin-site-update-indicator';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import Site from 'calypso/blocks/site';
import {
	getPluginOnSite,
	getPluginOnSites,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';
import { INSTALL_PLUGIN } from 'calypso/lib/plugins/constants';

/**
 * Style dependencies
 */
import './style.scss';

class PluginSiteNetwork extends React.Component {
	static displayName = 'PluginSiteNetwork';

	static propTypes = {
		site: PropTypes.object,
		plugin: PropTypes.object,
		secondarySites: PropTypes.array,
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
		return (
			<div className="plugin-site-network__actions">
				<PluginAutoupdateToggle
					site={ this.props.site }
					plugin={ this.props.pluginOnSite }
					wporg={ true }
				/>
				<PluginRemoveButton plugin={ this.props.pluginOnSite } site={ this.props.site } />
			</div>
		);
	};

	renderPluginSite = () => {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
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
						expanded={ false }
					/>
				}
				expandedSummary={
					<PluginUpdateIndicator
						site={ this.props.site }
						plugin={ this.props.plugin }
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
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	};

	renderSecondarySite = ( site ) => {
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

	renderSecondarySiteActions = ( site ) => {
		const sitePlugin = {
			...this.props.plugin,
			...this.props.pluginsOnSecondarySites?.sites[ site.ID ],
		};

		return (
			<div className="plugin-site-network__secondary-site-actions">
				<PluginActivateToggle site={ site } plugin={ sitePlugin } />
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

export default connect( ( state, { plugin, secondarySites, site } ) => {
	// eslint-disable-next-line wpcalypso/redux-no-bound-selectors
	const secondarySiteIds = secondarySites.map( ( secSite ) => secSite.ID );

	return {
		pluginOnSite: getPluginOnSite( state, site.ID, plugin.slug ),
		pluginsOnSecondarySites: getPluginOnSites( state, secondarySiteIds, plugin.slug ),
		installInProgress: isPluginActionInProgress( state, site.ID, plugin.id, INSTALL_PLUGIN ),
	};
} )( localize( PluginSiteNetwork ) );
