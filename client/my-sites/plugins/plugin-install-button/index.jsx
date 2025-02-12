/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-static-element-interactions */

import {
	WPCOM_FEATURES_INSTALL_PLUGINS,
	WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button, Gridicon, ExternalLink } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component, useRef } from 'react';
import { connect } from 'react-redux';
import InfoPopover from 'calypso/components/info-popover';
import {
	marketplacePlanToAdd,
	getProductSlugByPeriodVariation,
	getSaasRedirectUrl,
} from 'calypso/lib/plugins/utils';
import { getSiteFileModDisableReason } from 'calypso/lib/site/utils';
import { recordGoogleEvent, recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import { installPlugin } from 'calypso/state/plugins/installed/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import { getProductsList } from 'calypso/state/products-list/selectors';
import getSiteConnectionStatus from 'calypso/state/selectors/get-site-connection-status';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import { isCompatiblePlugin } from '../plugin-compatibility';
import { getPeriodVariationValue } from '../plugin-price';

import './style.scss';

const PluginInstallNotice = ( { isEmbed, warningText, children } ) => {
	const disabledInfoLabel = useRef();
	const infoPopover = useRef();
	const togglePopover = ( event ) => {
		infoPopover.current.handleClick( event );
	};
	return (
		<div className={ clsx( { 'plugin-install-button__install': true, embed: isEmbed } ) }>
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

export class PluginInstallButton extends Component {
	installAction = () => {
		const {
			isEmbed,
			siteId,
			selectedSite,
			isInstalling,
			plugin,
			canInstallPlugins,
			siteIsWpcomAtomic,
			recordGoogleEvent: recordGAEvent,
			recordTracksEvent: recordEvent,
		} = this.props;

		if ( isInstalling ) {
			return;
		}

		if ( canInstallPlugins && siteIsWpcomAtomic ) {
			this.props.removePluginStatuses( 'completed', 'error', 'up-to-date' );
			this.props.installPlugin( siteId, plugin );
		} else {
			return page( `/plugins/${ plugin.slug }/${ selectedSite.slug }` );
		}

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
		const {
			translate,
			selectedSite,
			siteId,
			userId,
			plugin,
			billingPeriod,
			canInstallPurchasedPlugins,
			productsList,
		} = this.props;
		const variationPeriod = getPeriodVariationValue( billingPeriod );
		const variation = plugin?.variations?.[ variationPeriod ];
		const product_slug = getProductSlugByPeriodVariation( variation, productsList );

		if ( plugin.isSaasProduct ) {
			const saasRedirectUrl = getSaasRedirectUrl( plugin, userId, siteId );
			return (
				<span className="plugin-install-button__install embed">
					<Button href={ saasRedirectUrl }>
						{ translate( 'Get started' ) }
						<Gridicon icon="external" size={ 18 } />
					</Button>
				</span>
			);
		}

		const buttonLink = canInstallPurchasedPlugins
			? `/checkout/${ selectedSite.slug }/${ product_slug }`
			: `/checkout/${ selectedSite.slug }/${ marketplacePlanToAdd(
					selectedSite?.plan,
					billingPeriod
			  ) },${ product_slug }#step2`;

		return (
			<span className="plugin-install-button__install embed">
				<Button href={ buttonLink }>
					<Gridicon key="plus-icon" icon="plus-small" size={ 18 } />
					{ canInstallPurchasedPlugins ? (
						<Gridicon icon="cart" size={ 18 } />
					) : (
						<Gridicon icon="plugins" size={ 18 } />
					) }
					{ canInstallPurchasedPlugins
						? translate( 'Purchase and activate' )
						: translate( 'Upgrade and activate' ) }
				</Button>
			</span>
		);
	}

	renderButton() {
		const {
			translate,
			isInstalling,
			isEmbed,
			disabled,
			isJetpackCloud,
			canInstallPlugins,
			siteIsWpcomAtomic,
		} = this.props;
		const label = isInstalling ? translate( 'Installing…' ) : translate( 'Install' );

		if ( isEmbed ) {
			return (
				<span className="plugin-install-button__install embed">
					{ isInstalling ? (
						<span className="plugin-install-button__installing">{ label }</span>
					) : (
						<Button compact onClick={ this.installAction } disabled={ disabled }>
							{ ! isJetpackCloud && (
								<>
									<Gridicon key="plus-icon" icon="plus-small" size={ 18 } />
									<Gridicon icon="plugins" size={ 18 } />
								</>
							) }
							{ canInstallPlugins && siteIsWpcomAtomic
								? translate( 'Install' )
								: translate( 'Go to plugin page' ) }
						</Button>
					) }
				</span>
			);
		}

		return (
			<span className="plugin-install-button__install">
				<Button onClick={ this.installAction } primary disabled={ isInstalling || disabled }>
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
			siteIsJetpackSite,
			siteIsWpcomAtomic,
			translate,
			canInstallPurchasedPlugins,
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

		const disabledInfo = this.getDisabledInfo();
		if ( ! selectedSite.canUpdateFiles && disabledInfo ) {
			return disabledInfo ? (
				<PluginInstallNotice warningText={ translate( 'Install Disabled' ) } isEmbed={ isEmbed }>
					{ disabledInfo }
				</PluginInstallNotice>
			) : null;
		}

		if ( siteIsJetpackSite && ! siteIsWpcomAtomic && plugin.isMarketplaceProduct ) {
			return (
				<PluginInstallNotice
					warningText={
						canInstallPurchasedPlugins
							? translate( 'Purchase disabled' )
							: translate( 'Upgrade disabled' )
					}
					isEmbed={ isEmbed }
				>
					<div>
						<p>{ translate( 'Paid plugins are not yet available for Jetpack Sites.' ) }</p>
					</div>
				</PluginInstallNotice>
			);
		}

		if ( ! plugin.isMarketplaceProduct ) {
			return this.renderButton();
		}

		return this.renderMarketplaceButton();
	}

	render() {
		return <div>{ this.renderNoticeOrButton() }</div>;
	}
}

PluginInstallButton.propTypes = {
	selectedSite: PropTypes.object.isRequired,
	plugin: PropTypes.object.isRequired,
	isEmbed: PropTypes.bool,
	isInstalling: PropTypes.bool,
	disabled: PropTypes.bool,
};

export default connect(
	( state, { selectedSite } ) => {
		const siteId = selectedSite && selectedSite.ID;

		return {
			siteId,
			userId: getCurrentUserId( state ),
			siteIsConnected: getSiteConnectionStatus( state, siteId ),
			siteIsWpcomAtomic: isSiteWpcomAtomic( state, siteId ),
			siteIsJetpackSite: isJetpackSite( state, siteId ),
			canInstallPurchasedPlugins: siteHasFeature(
				state,
				siteId,
				WPCOM_FEATURES_INSTALL_PURCHASED_PLUGINS
			),
			canInstallPlugins: siteHasFeature( state, siteId, WPCOM_FEATURES_INSTALL_PLUGINS ),
			productsList: getProductsList( state ),
		};
	},
	{
		installPlugin,
		removePluginStatuses,
		recordGoogleEvent,
		recordTracksEvent,
	}
)( localize( PluginInstallButton ) );
