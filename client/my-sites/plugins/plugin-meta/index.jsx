/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import i18n from 'i18n-calypso';
import { get, includes, some } from 'lodash';
import Gridicon from 'gridicons';
import { localize, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
import CompactCard from 'components/card/compact';
import Count from 'components/count';
import NoticeAction from 'components/notice/notice-action';
import ExternalLink from 'components/external-link';
import Notice from 'components/notice';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import PluginsActions from 'lib/plugins/actions';
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle';
import safeProtocolUrl from 'lib/safe-protocol-url';
import config from 'config';
import PluginInstallButton from 'my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'my-sites/plugins/plugin-remove-button';
import PluginInformation from 'my-sites/plugins/plugin-information';
import WpcomPluginInstallButton from 'my-sites/plugins/plugin-install-button-wpcom';
import PluginAutomatedTransfer from 'my-sites/plugins/plugin-automated-transfer';
import { getExtensionSettingsPath } from 'my-sites/plugins/utils';
import { userCan } from 'lib/site/utils';
import Banner from 'components/banner';
import { TYPE_BUSINESS, FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import { findFirstSimilarPlanKey } from 'lib/plans';
import { isBusiness, isEnterprise } from 'lib/products-values';
import { addSiteFragment } from 'lib/route';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';
import isAutomatedTransferActive from 'state/selectors/is-automated-transfer-active';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import QueryEligibility from 'components/data/query-atat-eligibility';
import { isATEnabled } from 'lib/automated-transfer';

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
			isBusiness( this.props.selectedSite.plan ) || isEnterprise( this.props.selectedSite.plan )
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
					/>
				) }
				{ canToggleAutoupdate && (
					<PluginAutoupdateToggle
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						wporg={ this.props.plugin.wporg }
						isMock={ this.props.isMock }
					/>
				) }
				{ canRemove && (
					<PluginRemoveButton
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						isMock={ this.props.isMock }
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

	isUnsupportedPluginForAT() {
		const { plugin } = this.props;

		// Pressable prevents installation of some plugins, so we need to disable AT for them.
		// More info here: https://kb.pressable.com/faq/does-pressable-restrict-any-plugins/
		const unsupportedPlugins = [
			// "reset" - break/interfere with provided functionality
			'advanced-database-cleaner',
			'advanced-reset-wp',
			'advanced-wp-reset',
			'autoptimize',
			'better-wp-security',
			'duplicator',
			'google-captcha',
			'file-manager-advanced',
			'file-manager',
			'reset-wp',
			'wordpress-database-reset',
			'wordpress-reset',
			'wp-automatic',
			'wp-clone-by-wp-academy',
			'wp-file-manager',
			'wp-prefix-changer',
			'wp-reset',
			'wpmu-database-reset',
			'z-inventory-manager',

			// backup
			'backup-wd',
			'backupwordpress',
			'backwpup',
			'updraftplus',
			'wp-db-backup',

			// caching
			'comet-cache',
			'hyper-cache',
			'quick-cache',
			'w3-total-cache',
			'wp-cache',
			'wp-fastest-cache',
			'wp-rocket',
			'wp-super-cache',

			// sql heavy
			'another-wordpress-classifieds-plugin',
			'native-ads-adnow',
			'page-visit-counter',
			'post-views-counter',
			'tokenad',
			'top-10',
			'wordpress-popular-posts',
			'wp-cerber',
			'wp-postviews',
			'wp-statistics',
			'wp-ulike',

			// security
			'wordfence',

			// spam
			'e-mail-broadcasting',
			'mailit',
			'send-email-from-admin',

			// cloning/staging
			'wp-staging',

			// misc
			'automatic-video-posts',
			'bwp-minify',
			'nginx-helper',
			'patron-button-and-widgets-by-codebard',
			'porn-embed',
			'video-importer',
			'woozone',
			'wp-cleanfix',
		];

		return includes( unsupportedPlugins, plugin.slug );
	}

	isWpcomInstallDisabled() {
		const { isTransfering } = this.props;

		return ! this.hasBusinessPlan() || this.isUnsupportedPluginForAT() || isTransfering;
	}

	isJetpackInstallDisabled() {
		const { automatedTransferSite } = this.props;

		return automatedTransferSite && this.isUnsupportedPluginForAT();
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
		const { selectedSite } = this.props;

		if ( selectedSite && this.isUnsupportedPluginForAT() ) {
			return (
				<Notice
					text={ this.props.translate(
						'Incompatible plugin: This plugin is not supported on WordPress.com.'
					) }
					status="is-warning"
					showDismiss={ false }
				>
					<NoticeAction href="https://support.wordpress.com/incompatible-plugins/">
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
					text={ i18n.translate(
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
		if ( newVersions.length > 0 ) {
			if ( this.props.selectedSite ) {
				return (
					<Notice
						status="is-warning"
						className="plugin-meta__version-notice"
						showDismiss={ false }
						icon="sync"
						text={ i18n.translate( 'Version %(newPluginVersion)s is available', {
							args: { newPluginVersion: newVersions[ 0 ].newVersion },
						} ) }
					>
						<NoticeAction onClick={ this.handlePluginUpdatesSingleSite }>
							{ i18n.translate( 'Update' ) }
						</NoticeAction>
					</Notice>
				);
			}
			const noticeMessage =
				newVersions.length > 1
					? i18n.translate(
							'Version %(newPluginVersion)s is available for %(numberOfSites)s sites',
							{
								args: {
									numberOfSites: newVersions.length,
									newPluginVersion: this.props.plugin.version,
								},
							}
					  )
					: i18n.translate( 'Version %(newPluginVersion)s is available for %(siteName)s', {
							args: {
								siteName: newVersions[ 0 ].title,
								newPluginVersion: this.props.plugin.version,
							},
					  } );
			const noticeActionMessage =
				newVersions.length > 1 ? i18n.translate( 'Update all' ) : i18n.translate( 'Update' );
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
		return some( this.props.plugin.compatibility, compatibleVersion => {
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
		return this.props.sites
			.map( site => {
				if ( ! site.canUpdateFiles ) {
					return null;
				}
				if ( site.plugin && site.plugin.update ) {
					if ( 'error' !== site.plugin.update && site.plugin.update.new_version ) {
						return {
							title: site.title,
							newVersion: site.plugin.update.new_version,
						};
					}
				}
			} )
			.filter( newVersions => newVersions );
	}

	handlePluginUpdatesSingleSite = event => {
		event.preventDefault();
		PluginsActions.updatePlugin( this.props.sites[ 0 ], this.props.sites[ 0 ].plugin );

		analytics.ga.recordEvent(
			'Plugins',
			'Clicked Update Selected Site Plugin',
			'Plugin Name',
			this.props.pluginSlug
		);
		analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.sites[ 0 ].ID,
			plugin: this.props.sites[ 0 ].plugin.slug,
			selected_site: this.props.sites[ 0 ].ID,
		} );
	};

	handlePluginUpdatesMultiSite = event => {
		event.preventDefault();
		this.props.sites.forEach( site => {
			const { plugin } = site;
			if (
				site.canUpdateFiles &&
				plugin.update &&
				'error' !== plugin.update &&
				plugin.update.new_version
			) {
				PluginsActions.updatePlugin( site, plugin );
				PluginsActions.removePluginsNotices( 'completed', 'error' );

				analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin_all_sites', {
					site: site,
					plugin: plugin.slug,
				} );
			}
		} );

		analytics.ga.recordEvent(
			'Plugins',
			'Clicked Update All Sites Plugin',
			'Plugin Name',
			this.props.pluginSlug
		);
	};

	render() {
		const cardClasses = classNames( 'plugin-meta__information', {
			'has-button': this.hasOrgInstallButton(),
			'has-site': !! this.props.selectedSite,
			'is-placeholder': !! this.props.isPlaceholder,
		} );

		const plugin =
			this.props.selectedSite && this.props.sites[ 0 ] && this.props.sites[ 0 ].plugin
				? this.props.sites[ 0 ].plugin
				: this.props.plugin;
		const path =
			( ! this.props.selectedSite || plugin.active ) && getExtensionSettingsPath( plugin );

		return (
			<div className="plugin-meta">
				{ this.props.atEnabled &&
					this.props.selectedSite && <QueryEligibility siteId={ this.props.selectedSite.ID } /> }
				<Card>
					{ this.displayBanner() }
					<div className={ cardClasses }>
						<div className="plugin-meta__detail">
							<PluginIcon
								image={ this.props.plugin && this.props.plugin.icon }
								isPlaceholder={ this.props.isPlaceholder }
							/>
							{ this.renderName() }
							<div className="plugin-meta__meta">{ this.renderAuthorUrl() }</div>
						</div>
						{ this.renderActions() }
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

				{ ! this.props.isMock &&
					get( this.props.selectedSite, 'jetpack' ) && (
						<PluginInformation
							plugin={ this.props.plugin }
							isPlaceholder={ this.props.isPlaceholder }
							site={ this.props.selectedSite }
							pluginVersion={ plugin && plugin.version }
							siteVersion={
								this.props.selectedSite && this.props.selectedSite.options.software_version
							}
							hasUpdate={ this.getAvailableNewVersions().length > 0 }
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
					( this.maybeDisplayUnsupportedNotice() || (
						<div className="plugin-meta__upgrade_nudge">
							<Banner
								feature={ FEATURE_UPLOAD_PLUGINS }
								event={ 'calypso_plugin_detail_page_upgrade_nudge' }
								plan={ findFirstSimilarPlanKey( this.props.selectedSite.plan.product_slug, {
									type: TYPE_BUSINESS,
								} ) }
								title={ this.props.translate( 'Upgrade to the Business plan to install plugins.' ) }
							/>
						</div>
					) ) }

				{ this.getVersionWarning() }
				{ this.getUpdateWarning() }
			</div>
		);
	}
}

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );

	return {
		atEnabled: isATEnabled( selectedSite ),
		isTransferring: isAutomatedTransferActive( state, siteId ),
		automatedTransferSite: isSiteAutomatedTransfer( state, siteId ),
		slug: getSiteSlug( state, siteId ),
	};
};

export default connect( mapStateToProps )( localize( PluginMeta ) );
