/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import { Button, Gridicon } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, useRef } from 'react';
import { connect } from 'react-redux';
import QuerySiteConnectionStatus from 'calypso/components/data/query-site-connection-status';
import ExternalLink from 'calypso/components/external-link';
import InfoPopover from 'calypso/components/info-popover';
import {
	isMarketplaceInstallationEligibleSite,
	businessPlanToAdd,
} from 'calypso/lib/plugins/utils';
import { getSiteFileModDisableReason, isMainNetworkSite } from 'calypso/lib/site/utils';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { installPlugin } from 'calypso/state/plugins/installed/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isCompatiblePlugin } from '../plugin-compatibility';
import { getPeriodVariationValue } from '../plugin-price';

import './style.scss';

export class PluginInstallButton extends Component {
	installAction = () => {
		const {
			isEmbed,
			siteId,
			isInstalling,
			plugin,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;

		if ( isInstalling ) {
			return;
		}

		this.props.removePluginStatuses( 'completed', 'error' );
		this.props.installPlugin( siteId, plugin );

		if ( isEmbed ) {
			recordGAEvent( 'Plugins', 'Install with no selected site', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_install_click_from_sites_list', {
				site: siteId,
				plugin: plugin.slug,
			} );
		} else {
			recordGAEvent( 'Plugins', 'Install on selected Site', 'Plugin Name', plugin.slug );
			recordEvent( 'calypso_plugin_install_click_from_plugin_info', {
				site: siteId,
				plugin: plugin.slug,
			} );
		}
	};

	updateJetpackAction = () => {
		const {
			plugin,
			siteId,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;

		recordGAEvent( 'Plugins', 'Update jetpack', 'Plugin Name', plugin.slug );
		recordEvent( 'calypso_plugin_update_jetpack', {
			site: siteId,
			plugin: plugin.slug,
		} );
	};

	clickSupportLink = () => {
		this.props.recordGoogleEvent(
			'Plugins',
			'Clicked How do I fix disabled plugin installs unresponsive site.'
		);
	};

	clickSiteManagmentLink = () => {
		this.props.recordGoogleEvent( 'Plugins', 'Clicked How do I fix disabled plugin installs' );
	};

	getDisabledInfo() {
		const { translate, selectedSite, siteId } = this.props;
		if ( ! selectedSite ) {
			// we don't have enough info
			return null;
		}

		if ( selectedSite.options.is_multi_network ) {
			return translate(
				'%(site)s is part of a multi-network installation, which is not currently supported.',
				{
					args: { site: selectedSite.title },
				}
			);
		}

		if ( ! isMainNetworkSite( selectedSite ) ) {
			return translate( 'Only the main site on a multi-site installation can install plugins.', {
				args: { site: selectedSite.title },
			} );
		}

		if ( ! selectedSite.canUpdateFiles && selectedSite.options.file_mod_disabled ) {
			const reasons = getSiteFileModDisableReason( selectedSite, 'modifyFiles' );
			const html = [];

			if ( reasons.length > 1 ) {
				html.push(
					<p key="reason-shell">
						{ translate( 'Plugin install is not available for %(site)s:', {
							args: { site: selectedSite.title },
						} ) }
					</p>
				);
				const list = reasons.map( ( reason, i ) => (
					<li key={ 'reason-i' + i + '-' + siteId }>{ reason }</li>
				) );
				html.push(
					// eslint-disable-next-line wpcalypso/jsx-classname-namespace
					<ul className="plugin-action__disabled-info-list" key="reason-shell-list">
						{ list }
					</ul>
				);
			} else {
				html.push(
					<p key="reason-shell">
						{ translate( 'Plugin install is not available for %(site)s. %(reason)s', {
							args: { site: selectedSite.title, reason: reasons[ 0 ] },
						} ) }
					</p>
				);
			}
			html.push(
				<ExternalLink
					key="external-link"
					onClick={ this.clickSiteManagmentLink }
					href="https://jetpack.me/support/site-management/#file-update-disabled"
				>
					{ translate( 'How do I fix this?' ) }
				</ExternalLink>
			);

			return html;
		}
		return null;
	}

	renderMarketplaceButton() {
		const { translate, selectedSite, plugin, billingPeriod } = this.props;
		const variationPeriod = getPeriodVariationValue( billingPeriod );
		const product_slug = plugin?.variations?.[ variationPeriod ]?.product_slug;
		const pluginInstallEligibleSite = isMarketplaceInstallationEligibleSite( selectedSite );
		const buttonLink = pluginInstallEligibleSite
			? `/checkout/${ selectedSite.slug }/${ product_slug }?redirect_to=/marketplace/thank-you/${ plugin.slug }/${ selectedSite.slug }#step2`
			: `/checkout/${ selectedSite.slug }/${ businessPlanToAdd(
					selectedSite?.plan,
					billingPeriod
			  ) },${ product_slug }?redirect_to=/marketplace/thank-you/${ plugin.slug }/${
					selectedSite.slug
			  }#step2`;

		return (
			<span className="plugin-install-button__install embed">
				<Button href={ buttonLink }>
					<Gridicon key="plus-icon" icon="plus-small" size={ 18 } />
					<Gridicon icon="plugins" size={ 18 } />
					{ pluginInstallEligibleSite
						? translate( 'Purchase and activate' )
						: translate( 'Upgrade and activate' ) }
				</Button>
			</span>
		);
	}

	renderButton() {
		const { translate, isInstalling, isEmbed, disabled } = this.props;
		const label = isInstalling ? translate( 'Installing…' ) : translate( 'Install' );

		if ( isEmbed ) {
			return (
				<span className="plugin-install-button__install embed">
					{ isInstalling ? (
						<span className="plugin-install-button__installing">{ label }</span>
					) : (
						<Button compact={ true } onClick={ this.installAction } disabled={ disabled }>
							<Gridicon key="plus-icon" icon="plus-small" size={ 18 } />
							<Gridicon icon="plugins" size={ 18 } />
							{ translate( 'Install' ) }
						</Button>
					) }
				</span>
			);
		}

		return (
			<span className="plugin-install-button__install">
				<Button
					onClick={ this.installAction }
					primary={ true }
					disabled={ isInstalling || disabled }
				>
					{ label }
				</Button>
			</span>
		);
	}

	renderNoticeOrButton() {
		const {
			plugin,
			isEmbed,
			selectedSite,
			siteIsConnected,
			siteIsWpcomAtomic,
			translate,
		} = this.props;

		if ( siteIsConnected === false ) {
			return (
				<PluginInstallNotice warningText={ translate( 'Site unreachable' ) } isEmbed={ isEmbed }>
					<div>
						<p>
							{ translate( '%(site)s is unresponsive.', { args: { site: selectedSite.title } } ) }
						</p>
						<ExternalLink
							key="external-link"
							onClick={ this.clickSupportLink }
							href={ 'https://jetpack.me/support/debug/?url=' + selectedSite.URL }
						>
							{ translate( 'Debug site!' ) }
						</ExternalLink>
					</div>
				</PluginInstallNotice>
			);
		}

		if ( ! isCompatiblePlugin( plugin.slug ) && siteIsWpcomAtomic ) {
			return (
				<PluginInstallNotice warningText={ translate( 'Incompatible Plugin' ) } isEmbed={ isEmbed }>
					<div>
						<p>{ translate( 'This plugin is not supported on WordPress.com.' ) }</p>
						<ExternalLink
							key="external-link"
							href={ localizeUrl( 'https://en.support.wordpress.com/incompatible-plugins' ) }
						>
							{ translate( 'Learn more.' ) }
						</ExternalLink>
					</div>
				</PluginInstallNotice>
			);
		}

		if ( ! selectedSite.canUpdateFiles ) {
			const disabledInfo = this.getDisabledInfo();
			return disabledInfo ? (
				<PluginInstallNotice warningText={ translate( 'Install Disabled' ) } isEmbed={ isEmbed }>
					{ disabledInfo }
				</PluginInstallNotice>
			) : null;
		}

		if ( ! plugin.isMarketplaceProduct ) {
			return this.renderButton();
		}

		return this.renderMarketplaceButton();
	}

	render() {
		const { siteId } = this.props;

		return (
			<div>
				<QuerySiteConnectionStatus siteId={ siteId } />
				{ this.renderNoticeOrButton() }
			</div>
		);
	}
}

const PluginInstallNotice = ( { isEmbed, warningText, children } ) => {
	const disabledInfoLabel = useRef();
	const infoPopover = useRef();
	const togglePopover = ( event ) => {
		infoPopover.current._onClick( event );
	};
	return (
		<div className={ classNames( { 'plugin-install-button__install': true, embed: isEmbed } ) }>
			<span
				onClick={ togglePopover }
				ref={ disabledInfoLabel }
				className="plugin-install-button__warning"
			>
				{ warningText }
			</span>
			<InfoPopover
				position="bottom left"
				popoverName="Plugin Action Disabled Install"
				gaEventCategory="Plugins"
				ref={ infoPopover }
				ignoreContext={ disabledInfoLabel.current }
			>
				{ children }
			</InfoPopover>
		</div>
	);
};

PluginInstallButton.propTypes = {
	selectedSite: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
	isEmbed: PropTypes.bool,
	isInstalling: PropTypes.bool,
	isMock: PropTypes.bool,
	disabled: PropTypes.bool,
};

export default connect(
	( state, { selectedSite } ) => {
		const siteId = selectedSite && selectedSite.ID;

		return {
			siteId,
			siteIsConnected: getSiteConnectionStatus( state, siteId ),
			siteIsWpcomAtomic: isSiteWpcomAtomic( state, siteId ),
		};
	},
	{
		installPlugin,
		removePluginStatuses,
		recordGoogleEvent,
		recordTracksEvent,
	}
)( localize( PluginInstallButton ) );
