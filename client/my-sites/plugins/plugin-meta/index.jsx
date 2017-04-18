/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import i18n from 'i18n-calypso';
import some from 'lodash/some';
import get from 'lodash/get';
import { includes } from 'lodash';
import { isEmpty } from 'lodash';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Button from 'components/button';
import Card from 'components/card';
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
import WpcomPluginInstallButton from 'my-sites/plugins-wpcom/plugin-install-button';
import PluginAutomatedTransfer from 'my-sites/plugins/plugin-automated-transfer';
import { userCan } from 'lib/site/utils';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { FEATURE_UPLOAD_PLUGINS } from 'lib/plans/constants';
import {
	isBusiness,
	isEnterprise
} from 'lib/products-values';
import { getSelectedSiteId, getSelectedSite } from 'state/ui/selectors';
import { isAutomatedTransferActive, isSiteAutomatedTransfer } from 'state/selectors';
import QueryEligibility from 'components/data/query-atat-eligibility';
import { isATEnabled } from 'lib/automated-transfer';

const PluginMeta = React.createClass( {
	OUT_OF_DATE_YEARS: 2,

	propTypes: {
		siteURL: React.PropTypes.string,
		sites: React.PropTypes.array,
		notices: React.PropTypes.object,
		plugin: React.PropTypes.object.isRequired,
		isInstalledOnSite: React.PropTypes.bool,
		isPlaceholder: React.PropTypes.bool,
		isMock: React.PropTypes.bool,
		allowedActions: React.PropTypes.shape( {
			activation: React.PropTypes.bool,
			autoupdate: React.PropTypes.bool,
			remove: React.PropTypes.bool,
		} ),
	},

	getDefaultProps() {
		return {
			allowedActions: {
				activation: true,
				autoupdate: true,
				remove: true,
			}
		};
	},

	displayBanner() {
		if ( this.props.plugin && this.props.plugin.banners && ( this.props.plugin.banners.high || this.props.plugin.banners.low ) ) {
			return <div className="plugin-meta__banner">
						<img className="plugin-meta__banner-image"
						src={ this.props.plugin.banners.high || this.props.plugin.banners.low } />
					</div>;
		}
	},

	hasBusinessPlan() {
		if ( ! this.props.selectedSite ) {
			return false;
		}
		return isBusiness( this.props.selectedSite.plan ) || isEnterprise( this.props.selectedSite.plan );
	},

	isWpcomPreinstalled: function() {
		const installedPlugins = [ 'Jetpack by WordPress.com', 'Akismet', 'VaultPress' ];

		if ( ! this.props.selectedSite ) {
			return false;
		}

		return ! this.props.selectedSite.jetpack && includes( installedPlugins, this.props.plugin.name );
	},

	renderActions() {
		if ( ! this.props.selectedSite ) {
			return (
				<div className="plugin-meta__actions">
					<div className="plugin-item__count">
						{
							this.translate( 'Sites {{count/}}',
								{
									components: {
										count: <Count count={ this.props.sites.length } />
									}
								}
							)
						}
					</div>
				</div>
			);
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
						<Gridicon icon="checkmark" />{ this.translate( 'Active' ) }
					</Button>
				</div>
			);
		}

		if ( this.props.isInstalledOnSite === false || ! this.props.selectedSite.jetpack ) {
			return ( <div className="plugin-meta__actions"> { this.getInstallButton() } </div> );
		}

		const {
			autoupdate: canToggleAutoupdate,
			activation: canToggleActivation,
			remove: canRemove,
		} = this.props.allowedActions;
		return (
			<div className="plugin-meta__actions">
				{ canToggleActivation && <PluginActivateToggle
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						notices={ this.props.notices }
						isMock={ this.props.isMock } /> }
				{ canToggleAutoupdate && <PluginAutoupdateToggle
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						notices={ this.props.notices }
						wporg={ this.props.plugin.wporg }
						isMock={ this.props.isMock } /> }
				{ canRemove && <PluginRemoveButton
						plugin={ this.props.plugin }
						site={ this.props.selectedSite }
						notices={ this.props.notices }
						isMock={ this.props.isMock } /> }
			</div>
		);
	},

	renderName() {
		if ( ! this.props.plugin || ! this.props.plugin.name ) {
			return;
		}

		return (
			<div className="plugin-meta__name">{ this.props.plugin.name }</div>
		);
	},

	renderAuthorUrl() {
		if ( ! this.props.plugin || ! ( this.props.plugin.author_url && this.props.plugin.author_name ) ) {
			return;
		}
		const linkToAuthor = (
			<ExternalLink className="plugin-meta__author" href={ safeProtocolUrl( this.props.plugin.author_url ) } target="_blank">
				{ this.props.plugin.author_name }
			</ExternalLink>
		);

		return this.translate( 'By {{linkToAuthor/}}', {
			components: {
				linkToAuthor
			}
		} );
	},

	isUnsupportedPlugin() {
		const { plugin } = this.props;

		// Pressable prevents installation of some plugins, so we need to disable AT for them.
		// More info here: https://kb.pressable.com/faq/does-pressable-restrict-any-plugins/
		const unsupportedPlugins = [
			'nginx-helper',
			'w3-total-cache',
			'wp-rocket',
			'wp-super-cache',
			'bwp-minify',
		];

		return includes( unsupportedPlugins, plugin.slug );
	},

	isWpcomInstallDisabled() {
		const { isTransfering } = this.props;

		return ! this.hasBusinessPlan() || this.isUnsupportedPlugin() || isTransfering;
	},

	isJetpackInstallDisabled() {
		const { automatedTransferSite } = this.props;

		return automatedTransferSite && this.isUnsupportedPlugin();
	},

	getInstallButton() {
		const { selectedSite } = this.props;

		if ( selectedSite && selectedSite.jetpack && this.hasOrgInstallButton() ) {
			return (
				<PluginInstallButton
					disabled={ this.isJetpackInstallDisabled() }
					{ ...this.props }
				/>
			);
		}

		if ( selectedSite && ! selectedSite.jetpack ) {
			return (
				<WpcomPluginInstallButton
					disabled={ this.isWpcomInstallDisabled() }
					plugin={ this.props.plugin }
				/>
			);
		}
	},

	maybeDisplayUnsupportedNotice() {
		const { selectedSite, automatedTransferSite } = this.props;

		if ( selectedSite && this.isUnsupportedPlugin() && ( ! selectedSite.jetpack || automatedTransferSite ) ) {
			return (
				<Notice
					text={ this.translate( 'Incompatible plugin: WordPress.com already provides this feature.' ) }
					status="is-warning"
					showDismiss={ false }
				>
					<NoticeAction href="https://support.wordpress.com/incompatible-plugins/">
						{ this.translate( 'More info' ) }
					</NoticeAction>
				</Notice>
			);
		}
	},

	isOutOfDate() {
		if ( this.props.plugin && this.props.plugin.last_updated ) {
			const lastUpdated = this.moment( this.props.plugin.last_updated, 'YYYY-MM-DD' );
			return this.moment().diff( lastUpdated, 'years' ) >= this.OUT_OF_DATE_YEARS;
		}
		return false;
	},

	getVersionWarning() {
		const newVersions = this.getAvailableNewVersions();
		if ( this.isOutOfDate() && newVersions.length === 0 ) {
			return <Notice
				className="plugin-meta__version-notice"
				text={ this.translate( 'This plugin hasn\'t been updated in over 2 years. It may no longer be maintained or ' +
					'supported and may have compatibility issues when used with more recent versions of WordPress' ) }
				status="is-warning"
				showDismiss={ false } />;
		} else if ( config.isEnabled( 'manage/plugins/compatibility-warning' ) && ! this.isVersionCompatible() ) {
			return <Notice
				className="plugin-meta__version-notice"
				text={ i18n.translate( 'The new version of this plugin may not be compatible with your version of WordPress' ) }
				status="is-warning"
				showDismiss={ false } />;
		}
	},

	getDefaultActionLinks() {
		const adminUrl = get( this.props, 'selectedSite.options.admin_url' );
		return adminUrl
			? { [ i18n.translate( 'WP Admin' ) ]: adminUrl }
			: null;
	},

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
						text={ i18n.translate( 'A new version is available.' ) }>
						<NoticeAction onClick={ this.handlePluginUpdatesSingleSite }>
							{
								i18n.translate( 'Update to %(newPluginVersion)s',
									{ args: { newPluginVersion: newVersions[ 0 ].newVersion } }
								)
							}
						</NoticeAction>
					</Notice>
				);
			}
			const noticeMessage = newVersions.length > 1
				? i18n.translate( 'Version %(newPluginVersion)s is available for %(numberOfSites)s sites',
					{ args: { numberOfSites: newVersions.length, newPluginVersion: this.props.plugin.version } } )
				: i18n.translate( 'Version %(newPluginVersion)s is available for %(siteName)s',
					{ args: { siteName: newVersions[ 0 ].title, newPluginVersion: this.props.plugin.version } } );
			const noticeActionMessage = newVersions.length > 1
				? i18n.translate( 'Update all' )
				: i18n.translate( 'Update' );
			return (
				<Notice
					status="is-warning"
					className="plugin-meta__version-notice"
					showDismiss={ false }
					icon="sync"
					text={ noticeMessage }>
					<NoticeAction onClick={ this.handlePluginUpdatesMultiSite }>
						{ noticeActionMessage }
					</NoticeAction>
				</Notice>
			);
		}
	},

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
	},

	hasOrgInstallButton() {
		if ( this.props.selectedSite ) {
			return ! this.props.isInstalledOnSite &&
				userCan( 'manage_options', this.props.selectedSite ) &&
				this.props.selectedSite.jetpack;
		}
	},

	getAvailableNewVersions() {
		return this.props.sites.map( site => {
			if ( ! site.canUpdateFiles ) {
				return null;
			}
			if ( site.plugin && site.plugin.update ) {
				if ( 'error' !== site.plugin.update && site.plugin.update.new_version ) {
					return {
						title: site.title,
						newVersion: site.plugin.update.new_version
					};
				}
			}
		} ).filter( newVersions => newVersions );
	},

	handlePluginUpdatesSingleSite( event ) {
		event.preventDefault();
		PluginsActions.updatePlugin( this.props.sites[ 0 ], this.props.sites[ 0 ].plugin );

		analytics.ga.recordEvent( 'Plugins', 'Clicked Update Selected Site Plugin', 'Plugin Name', this.props.pluginSlug );
		analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin', {
			site: this.props.sites[ 0 ].ID,
			plugin: this.props.sites[ 0 ].plugin.slug,
			selected_site: this.props.sites[ 0 ].ID
		} );
	},

	handlePluginUpdatesMultiSite( event ) {
		event.preventDefault();
		this.props.sites.forEach( ( site ) => {
			const { plugin } = site;
			if ( site.canUpdateFiles && plugin.update && 'error' !== plugin.update && plugin.update.new_version ) {
				PluginsActions.updatePlugin( site, plugin );
				PluginsActions.removePluginsNotices( this.props.notices.completed.concat( this.props.notices.errors ) );

				analytics.tracks.recordEvent( 'calypso_plugins_actions_update_plugin_all_sites', {
					site: site,
					plugin: plugin.slug
				} );
			}
		} );

		analytics.ga.recordEvent( 'Plugins', 'Clicked Update All Sites Plugin', 'Plugin Name', this.props.pluginSlug );
	},

	render() {
		const cardClasses = classNames( 'plugin-meta__information', {
			'has-button': this.hasOrgInstallButton(),
			'has-site': !! this.props.selectedSite,
			'is-placeholder': !! this.props.isPlaceholder
		} );

		const plugin = this.props.selectedSite && this.props.sites[ 0 ] ? this.props.sites[ 0 ].plugin : this.props.plugin;
		let actionLinks = get( plugin, 'action_links' );
		if ( get( plugin, 'active' ) && isEmpty( actionLinks ) ) {
			actionLinks = this.getDefaultActionLinks();
		}

		return (
			<div className="plugin-meta">
				{ this.props.atEnabled && this.props.selectedSite &&
					<QueryEligibility siteId={ this.props.selectedSite.ID } />
				}
				<Card>
					{ this.displayBanner() }
					<div className={ cardClasses } >
						<div className="plugin-meta__detail">
							<PluginIcon image={ this.props.plugin && this.props.plugin.icon } isPlaceholder={ this.props.isPlaceholder } />
							{ this.renderName() }
							<div className="plugin-meta__meta">
								{ this.renderAuthorUrl() }
							</div>
							{ ! isEmpty( actionLinks ) &&
								<div className="plugin-meta__action-links">
									{ Object.keys( actionLinks ).map( linkTitle => (
										<Button compact icon
											href={ actionLinks[ linkTitle ] }
											target="_blank"
											rel="noopener noreferrer">
												{ linkTitle } <Gridicon icon="external" />
										</Button>
									) ) }
								</div>
							}
						</div>
						{ this.renderActions() }
					</div>
					{ ! this.props.isMock && get( this.props.selectedSite, 'jetpack' ) &&
						<PluginInformation
							plugin={ this.props.plugin }
							isPlaceholder={ this.props.isPlaceholder }
							site={ this.props.selectedSite }
							pluginVersion={ plugin && plugin.version }
							siteVersion={ this.props.selectedSite && this.props.selectedSite.options.software_version }
							hasUpdate={ this.getAvailableNewVersions().length > 0 }
						/>
					}
				</Card>

				{ this.props.atEnabled &&
					this.maybeDisplayUnsupportedNotice()
				}

				{ this.props.atEnabled && this.hasBusinessPlan() && ! get( this.props.selectedSite, 'jetpack' ) &&
					<PluginAutomatedTransfer plugin={ this.props.plugin } />
				}

				{ ( get( this.props.selectedSite, 'jetpack' ) || this.hasBusinessPlan() || this.isWpcomPreinstalled() ) &&
					<div style={ { marginBottom: 16 } } />
				}

				{ ! get( this.props.selectedSite, 'jetpack' ) && ! this.hasBusinessPlan() && ! this.isWpcomPreinstalled() &&
					<div className="plugin-meta__upgrade_nudge">
						<UpgradeNudge
							feature={ FEATURE_UPLOAD_PLUGINS }
							title={ this.translate( 'Upgrade to the Business plan to install plugins.' ) }
							message={ this.translate( 'Upgrade to the Business plan to install plugins.' ) }
							event={ 'calypso_plugins_page_upgrade_nudge' }
						/>
					</div>
				}

				{ this.getVersionWarning() }
				{ this.getUpdateWarning() }
			</div>
		);
	}
} );

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const selectedSite = getSelectedSite( state );

	return {
		atEnabled: isATEnabled( selectedSite ),
		isTransferring: isAutomatedTransferActive( state, siteId ),
		automatedTransferSite: isSiteAutomatedTransfer( state, siteId ),
	};
};

export default connect( mapStateToProps )( PluginMeta );
