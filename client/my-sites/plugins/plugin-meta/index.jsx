/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { get, includes, some } from 'lodash';
import { localize } from 'i18n-calypso';
import moment from 'moment';

/**
 * Internal dependencies
 */
import Gridicon from 'calypso/components/gridicon';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { gaRecordEvent } from 'calypso/lib/analytics/ga';
import { Button, Card, CompactCard } from '@automattic/components';
import Count from 'calypso/components/count';
import NoticeAction from 'calypso/components/notice/notice-action';
import ExternalLink from 'calypso/components/external-link';
import Notice from 'calypso/components/notice';
import PluginIcon from 'calypso/my-sites/plugins/plugin-icon/plugin-icon';
import PluginActivateToggle from 'calypso/my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'calypso/my-sites/plugins/plugin-autoupdate-toggle';
import safeProtocolUrl from 'calypso/lib/safe-protocol-url';
import config from '@automattic/calypso-config';
import { isCompatiblePlugin } from 'calypso/my-sites/plugins/plugin-compatibility';
import PluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'calypso/my-sites/plugins/plugin-remove-button';
import PluginInformation from 'calypso/my-sites/plugins/plugin-information';
import WpcomPluginInstallButton from 'calypso/my-sites/plugins/plugin-install-button-wpcom';
import PluginAutomatedTransfer from 'calypso/my-sites/plugins/plugin-automated-transfer';
import { getExtensionSettingsPath, siteObjectsToSiteIds } from 'calypso/my-sites/plugins/utils';
import { userCan } from 'calypso/lib/site/utils';
import UpsellNudge from 'calypso/blocks/upsell-nudge';
import {
	findFirstSimilarPlanKey,
	FEATURE_UPLOAD_PLUGINS,
	TYPE_BUSINESS,
	isBusiness,
	isEcommerce,
	isEnterprise,
} from '@automattic/calypso-products';
import { addSiteFragment } from 'calypso/lib/route';
import { getSelectedSiteId, getSelectedSite } from 'calypso/state/ui/selectors';
import { getSiteSlug, isJetpackSite } from 'calypso/state/sites/selectors';
import isVipSite from 'calypso/state/selectors/is-vip-site';
import { isAutomatedTransferActive } from 'calypso/state/automated-transfer/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import QueryEligibility from 'calypso/components/data/query-atat-eligibility';
import { isATEnabled } from 'calypso/lib/automated-transfer';
import {
	getPluginOnSites,
	isPluginActionInProgress,
} from 'calypso/state/plugins/installed/selectors';
import { updatePlugin } from 'calypso/state/plugins/installed/actions';
import { removePluginStatuses } from 'calypso/state/plugins/installed/status/actions';
import {
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
} from 'calypso/lib/plugins/constants';

const activationPreventionActions = [
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
	REMOVE_PLUGIN,
];
const autoupdatePreventionActions = [ ACTIVATE_PLUGIN, DEACTIVATE_PLUGIN, REMOVE_PLUGIN ];
const removalPreventionActions = [
	ACTIVATE_PLUGIN,
	DEACTIVATE_PLUGIN,
	ENABLE_AUTOUPDATE_PLUGIN,
	DISABLE_AUTOUPDATE_PLUGIN,
];

/**
 * Style dependencies
 */
import './style.scss';

export class PluginMeta extends Component {
	static OUT_OF_DATE_YEARS = 2;

	static propTypes = {
		siteURL: PropTypes.string,
		sites: PropTypes.array,
		plugin: PropTypes.object.isRequired,
		isInstalledOnSite: PropTypes.bool,
		isPlaceholder: PropTypes.bool,
		isMock: PropTypes.bool,
		allowedActions: PropTypes.shape( {
			activation: PropTypes.bool,
			autoupdate: PropTypes.bool,
			remove: PropTypes.bool,
		} ),
	};

	static defaultProps = {
		allowedActions: {
			activation: true,
			autoupdate: true,
			remove: true,
		},
	};

	displayBanner() {
		if (
			this.props.plugin &&
			this.props.plugin.banners &&
			( this.props.plugin.banners.high || this.props.plugin.banners.low )
		) {
			return (
				<div className="plugin-meta__banner">
					<img
						className="plugin-meta__banner-image"
						alt={ this.props.plugin.name }
						src={ this.props.plugin.banners.high || this.props.plugin.banners.low }
					/>
				</div>
			);
		}
	}

	hasBusinessPlan() {
		if ( ! this.props.selectedSite ) {
			return false;
		}
		return (
			isBusiness( this.props.selectedSite.plan ) ||
			isEnterprise( this.props.selectedSite.plan ) ||
			isEcommerce( this.props.selectedSite.plan )
		);
	}

	getPlan() {
		if ( ! this.props.selectedSite ) {
			return false;
		}
		return this.props.selectedSite.plan();
	}

	isWpcomPreinstalled = () => {
		const installedPlugins = [ 'Jetpack by WordPress.com', 'Akismet', 'VaultPress' ];

		if ( ! this.props.selectedSite ) {
			return false;
		}

		return (
			! this.props.selectedSite.jetpack && includes( installedPlugins, this.props.plugin.name )
		);
	};

	renderSupportedFlag() {
		const supportedAuthors = [ 'Automattic', 'WooCommerce' ];
		const { plugin, translate } = this.props;
		if (
			this.props.isJetpackSite ||
			! supportedAuthors.find( ( author ) => author === plugin.author_name )
		) {
			return;
		}

		return (
			<div className="plugin-meta__supported-flag">
				{ translate( 'Supported by WordPress.com' ) }
			</div>
		);
	}

	renderActions() {
		if ( ! this.props.selectedSite ) {
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			return (
				<div className="plugin-meta__actions">
					<div className="plugin-item__count">
						{ this.props.translate( 'Sites {{count/}}', {
							components: {
								count: <Count count={ this.props.sites.length } />,
							},
						} ) }
					</div>
				</div>
			);
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		}

		if ( this.props.isPlaceholder ) {
			return;
		}

		if ( this.props.isInstalledOnSite === null && this.props.selectedSite.jetpack ) {
			return;
		}

		if ( this.isWpcomPreinstalled() ) {
			return (
				<div className="plugin-meta__actions">
					<Button className="plugin-meta__active" compact borderless>
						<Gridicon icon="checkmark" />
						{ this.props.translate( 'Active' ) }
					</Button>
				</div>
			);
		}

		if ( this.props.isInstalledOnSite === false || ! this.props.selectedSite.jetpack ) {
			return <div className="plugin-meta__actions"> { this.getInstallButton() } </div>;
		}

		const {
			autoupdate: canToggleAutoupdate,
			activation: canToggleActivation,
			remove: canRemove,
		} = this.props.allowedActions;
		return (
			<div className="plugin-meta__actions">
				{ canToggleActivation && (
					<PluginActivateToggle
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						isMock={ this.props.isMock }
						disabled={ this.props.disabledActivation }
					/>
				) }
				{ canToggleAutoupdate && (
					<PluginAutoupdateToggle
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						wporg={ this.props.plugin.wporg }
						isMock={ this.props.isMock }
						disabled={ this.props.disabledAutoupdate }
					/>
				) }
				{ canRemove && (
					<PluginRemoveButton
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						isMock={ this.props.isMock }
						disabled={ this.props.disabledRemoval }
					/>
				) }
			</div>
		);
	}

	renderName() {
		if ( ! this.props.plugin || ! this.props.plugin.name ) {
			return;
		}

		return <div className="plugin-meta__name">{ this.props.plugin.name }</div>;
	}

	renderAuthorUrl() {
		if (
			! this.props.plugin ||
			! ( this.props.plugin.author_url && this.props.plugin.author_name )
		) {
			return;
		}
		const linkToAuthor = (
			<ExternalLink
				className="plugin-meta__author"
				href={ safeProtocolUrl( this.props.plugin.author_url ) }
				target="_blank"
			>
				{ this.props.plugin.author_name }
			</ExternalLink>
		);

		return this.props.translate( 'By {{linkToAuthor/}}', {
			components: {
				linkToAuthor,
			},
		} );
	}

	isWpcomInstallDisabled() {
		const { isTransfering, plugin } = this.props;

		return ! this.hasBusinessPlan() || ! isCompatiblePlugin( plugin.slug ) || isTransfering;
	}

	isJetpackInstallDisabled() {
		const { automatedTransferSite, plugin } = this.props;

		return automatedTransferSite && ! isCompatiblePlugin( plugin.slug );
	}

	getInstallButton() {
		const { selectedSite } = this.props;

		if ( selectedSite && selectedSite.jetpack && this.hasOrgInstallButton() ) {
			return <PluginInstallButton disabled={ this.isJetpackInstallDisabled() } { ...this.props } />;
		}

		if ( selectedSite && ! selectedSite.jetpack ) {
			return (
				<WpcomPluginInstallButton
					disabled={ this.isWpcomInstallDisabled() }
					plugin={ this.props.plugin }
				/>
			);
		}
	}

	maybeDisplayUnsupportedNotice() {
		const { plugin, selectedSite } = this.props;

		if ( selectedSite && ! isCompatiblePlugin( plugin.slug ) ) {
			return (
				<Notice
					text={ this.props.translate(
						'Incompatible plugin: This plugin is not supported on WordPress.com.'
					) }
					status="is-warning"
					showDismiss={ false }
				>
					<NoticeAction href="https://wordpress.com/support/incompatible-plugins/">
						{ this.props.translate( 'More info' ) }
					</NoticeAction>
				</Notice>
			);
		}
	}

	isOutOfDate() {
		if ( this.props.plugin && this.props.plugin.last_updated ) {
			const lastUpdated = moment( this.props.plugin.last_updated, 'YYYY-MM-DD' );
			return moment().diff( lastUpdated, 'years' ) >= this.OUT_OF_DATE_YEARS;
		}
		return false;
	}

	getVersionWarning() {
		const newVersions = this.getAvailableNewVersions();
		if ( this.isOutOfDate() && newVersions.length === 0 ) {
			return (
				<Notice
					className="plugin-meta__version-notice"
					text={ this.props.translate(
						"This plugin hasn't been updated in over 2 years. It may no longer be maintained or " +
							'supported and may have compatibility issues when used with more recent versions of WordPress'
					) }
					status="is-warning"
					showDismiss={ false }
				/>
			);
		} else if (
			config.isEnabled( 'manage/plugins/compatibility-warning' ) &&
			! this.isVersionCompatible()
		) {
			return (
				<Notice
					className="plugin-meta__version-notice"
					text={ this.props.translate(
						'The new version of this plugin may not be compatible with your version of WordPress'
					) }
					status="is-warning"
					showDismiss={ false }
				/>
			);
		}
	}

	getUpdateWarning() {
		const newVersions = this.getAvailableNewVersions();
		const { translate } = this.props;

		if ( newVersions.length > 0 ) {
			if ( this.props.selectedSite ) {
				return (
					<Notice
						status="is-warning"
						className="plugin-meta__version-notice"
						showDismiss={ false }
						icon="sync"
						text={ translate( 'Version %(newPluginVersion)s is available', {
							args: { newPluginVersion: newVersions[ 0 ].newVersion },
						} ) }
					>
						<NoticeAction onClick={ this.handlePluginUpdatesSingleSite }>
							{ translate( 'Update' ) }
						</NoticeAction>
					</Notice>
				);
			}
			const noticeMessage =
				newVersions.length > 1
					? translate( 'Version %(newPluginVersion)s is available for %(numberOfSites)s sites', {
							args: {
								numberOfSites: newVersions.length,
								newPluginVersion: this.props.plugin.version,
							},
					  } )
					: translate( 'Version %(newPluginVersion)s is available for %(siteName)s', {
							args: {
								siteName: newVersions[ 0 ].title,
								newPluginVersion: this.props.plugin.version,
							},
					  } );
			const noticeActionMessage =
				newVersions.length > 1 ? translate( 'Update all' ) : translate( 'Update' );
			return (
				<Notice
					status="is-warning"
					className="plugin-meta__version-notice"
					showDismiss={ false }
					icon="sync"
					text={ noticeMessage }
				>
					<NoticeAction onClick={ this.handlePluginUpdatesMultiSite }>
						{ noticeActionMessage }
					</NoticeAction>
				</Notice>
			);
		}
	}

	isVersionCompatible() {
		if ( ! this.props.selectedSite ) {
			return true;
		}

		// still not fetched
		if ( ! this.props.plugin.compatibility ) {
			return true;
		}

		if ( ! this.props.plugin.compatibility || this.props.plugin.compatibility.length === 0 ) {
			return false;
		}

		const siteVersion = this.props.selectedSite.options.software_version.split( '-' )[ 0 ];
		return some( this.props.plugin.compatibility, ( compatibleVersion ) => {
			return compatibleVersion.indexOf( siteVersion ) === 0;
		} );
	}

	hasOrgInstallButton() {
		if ( this.props.selectedSite ) {
			return (
				! this.props.isInstalledOnSite &&
				userCan( 'manage_options', this.props.selectedSite ) &&
				this.props.selectedSite.jetpack
			);
		}
	}

	getAvailableNewVersions() {
		const { pluginsOnSites } = this.props;
		return this.props.sites
			.map( ( site ) => {
				if ( ! site.canUpdateFiles ) {
					return null;
				}

				const sitePlugin = pluginsOnSites?.sites[ site.ID ];
				if ( sitePlugin?.update?.new_version && 'error' !== sitePlugin.update.new_version ) {
					return {
						title: site.title,
						newVersion: sitePlugin.update.new_version,
					};
				}
			} )
			.filter( ( newVersions ) => newVersions );
	}

	getPluginForSite = ( siteId ) => {
		return {
			...this.props.plugin,
			...this.props.pluginsOnSites?.sites[ siteId ],
		};
	};

	handlePluginUpdatesSingleSite = ( event ) => {
		event.preventDefault();
		const plugin = this.getPluginForSite( this.props.sites[ 0 ].ID );
		this.props.updatePlugin( this.props.sites[ 0 ].ID, plugin );

		gaRecordEvent(
			'Plugins',
			'Clicked Update Selected Site Plugin',
			'Plugin Name',
			this.props.pluginSlug
		);
		recordTracksEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.sites[ 0 ].ID,
			plugin: plugin.slug,
			selected_site: this.props.sites[ 0 ].ID,
		} );
	};

	handlePluginUpdatesMultiSite = ( event ) => {
		event.preventDefault();
		this.props.sites.forEach( ( site ) => {
			const plugin = this.getPluginForSite( site.ID );
			if (
				site.canUpdateFiles &&
				plugin.update &&
				'error' !== plugin.update &&
				plugin.update.new_version
			) {
				this.props.updatePlugin( site.ID, plugin );
				this.props.removePluginStatuses( 'completed', 'error' );

				recordTracksEvent( 'calypso_plugins_actions_update_plugin_all_sites', {
					site: site,
					plugin: plugin.slug,
				} );
			}
		} );

		gaRecordEvent(
			'Plugins',
			'Clicked Update All Sites Plugin',
			'Plugin Name',
			this.props.pluginSlug
		);
	};

	renderUpsell() {
		const { translate, slug } = this.props;

		if ( this.props.isVipSite ) {
			return null;
		}
		const bannerURL = `/checkout/${ slug }/business`;
		const plan = findFirstSimilarPlanKey( this.props.selectedSite.plan.product_slug, {
			type: TYPE_BUSINESS,
		} );
		const title = translate( 'Upgrade to the Business plan to install plugins.' );

		/* eslint-disable wpcalypso/jsx-classname-namespace */
		return (
			<div className="plugin-meta__upgrade_nudge">
				<UpsellNudge
					event="calypso_plugin_detail_page_upgrade_nudge"
					href={ bannerURL }
					feature={ FEATURE_UPLOAD_PLUGINS }
					plan={ plan }
					title={ title }
					showIcon={ true }
				/>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}

	render() {
		const cardClasses = classNames( 'plugin-meta__information', {
			'has-button': this.hasOrgInstallButton(),
			'has-site': !! this.props.selectedSite,
			'is-placeholder': !! this.props.isPlaceholder,
		} );

		let { plugin } = this.props;
		if ( this.props.selectedSite ) {
			plugin = this.getPluginForSite( this.props.selectedSite.ID );
		}

		const path =
			( ! this.props.selectedSite || plugin.active ) && getExtensionSettingsPath( plugin );

		return (
			<div className="plugin-meta">
				{ this.props.atEnabled && this.props.selectedSite && (
					<QueryEligibility siteId={ this.props.selectedSite.ID } />
				) }
				<Card>
					{ this.displayBanner() }
					<div className={ cardClasses }>
						<div className="plugin-meta__detail">
							<PluginIcon
								image={ this.props.plugin && this.props.plugin.icon }
								isPlaceholder={ this.props.isPlaceholder }
							/>
							{ this.renderName() }
							<div className="plugin-meta__meta">
								{ this.renderAuthorUrl() } { this.renderSupportedFlag() }
							</div>
						</div>
						{ ! this.props.calypsoify && this.renderActions() }
					</div>
				</Card>

				{ path && (
					<CompactCard
						className="plugin-meta__settings-link"
						href={ addSiteFragment( path, this.props.slug ) }
					>
						{ this.props.translate( 'Edit plugin settings' ) }
					</CompactCard>
				) }

				{ ! this.props.isMock && get( this.props.selectedSite, 'jetpack' ) && (
					<PluginInformation
						plugin={ this.props.plugin }
						isPlaceholder={ this.props.isPlaceholder }
						site={ this.props.selectedSite }
						pluginVersion={ plugin && plugin.version }
						siteVersion={
							this.props.selectedSite && this.props.selectedSite.options.software_version
						}
						hasUpdate={ this.getAvailableNewVersions().length > 0 }
						calypsoify={ this.props.calypsoify }
					/>
				) }

				{ this.props.atEnabled && this.maybeDisplayUnsupportedNotice() }

				{ this.props.atEnabled &&
					this.hasBusinessPlan() &&
					! get( this.props.selectedSite, 'jetpack' ) && (
						<PluginAutomatedTransfer plugin={ this.props.plugin } />
					) }

				{ ( ( this.props.selectedSite && get( this.props.selectedSite, 'jetpack' ) ) ||
					this.hasBusinessPlan() ||
					this.isWpcomPreinstalled() ) && <div style={ { marginBottom: 16 } } /> }

				{ this.props.selectedSite &&
					this.props.selectedSite.plan &&
					! get( this.props.selectedSite, 'jetpack' ) &&
					! this.hasBusinessPlan() &&
					! this.isWpcomPreinstalled() &&
					( this.maybeDisplayUnsupportedNotice() || this.renderUpsell() ) }

				{ this.getVersionWarning() }
				{ this.getUpdateWarning() }
			</div>
		);
	}
}

const mapStateToProps = ( state, { plugin, sites } ) => {
	const siteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );
	const siteIds = siteObjectsToSiteIds( sites );

	return {
		disabledActivation: isPluginActionInProgress(
			state,
			siteId,
			plugin.id,
			activationPreventionActions
		),
		disabledAutoupdate: isPluginActionInProgress(
			state,
			siteId,
			plugin.id,
			autoupdatePreventionActions
		),
		disabledRemoval: isPluginActionInProgress( state, siteId, plugin.id, removalPreventionActions ),
		atEnabled: isATEnabled( selectedSite ),
		isTransferring: isAutomatedTransferActive( state, siteId ),
		automatedTransferSite: isSiteAutomatedTransfer( state, siteId ),
		isVipSite: isVipSite( state, siteId ),
		slug: getSiteSlug( state, siteId ),
		pluginsOnSites: getPluginOnSites( state, siteIds, plugin.slug ),
		isJetpackSite: isJetpackSite( state, siteId ),
	};
};

export default connect( mapStateToProps, { removePluginStatuses, updatePlugin } )(
	localize( PluginMeta )
);
