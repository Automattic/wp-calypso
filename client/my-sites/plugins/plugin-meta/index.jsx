/**
 * External dependencies
 */
import React from 'react';
import classNames from 'classnames';
import i18n from 'i18n-calypso';
import some from 'lodash/some';

/**
 * Internal dependencies
 */
import analytics from 'lib/analytics';
import Card from 'components/card';
import NoticeAction from 'components/notice/notice-action';
import Notice from 'components/notice';
import PluginIcon from 'my-sites/plugins/plugin-icon/plugin-icon';
import PluginsActions from 'lib/plugins/actions';
import PluginsLog from 'lib/plugins/log-store';
import PluginActivateToggle from 'my-sites/plugins/plugin-activate-toggle';
import PluginAutoupdateToggle from 'my-sites/plugins/plugin-autoupdate-toggle';
import safeProtocolUrl from 'lib/safe-protocol-url';
import config from 'config';
import PluginInstallButton from 'my-sites/plugins/plugin-install-button';
import PluginRemoveButton from 'my-sites/plugins/plugin-remove-button';
import PluginSettingsLink from 'my-sites/plugins/plugin-settings-link';
import PluginInformation from 'my-sites/plugins/plugin-information';
import { userCan } from 'lib/site/utils';

export default React.createClass( {
	OUT_OF_DATE_YEARS: 2,

	displayName: 'PluginMeta',

	propTypes: {
		siteURL: React.PropTypes.string,
		sites: React.PropTypes.array,
		notices: React.PropTypes.object,
		plugin: React.PropTypes.object.isRequired,
		isInstalledOnSite: React.PropTypes.bool,
		isPlaceholder: React.PropTypes.bool,
		isMock: React.PropTypes.bool,
	},

	displayBanner() {
		if ( this.props.plugin && this.props.plugin.banners && ( this.props.plugin.banners.high || this.props.plugin.banners.low ) ) {
			return <div className="plugin-meta__banner">
						<img className="plugin-meta__banner-image" src={ this.props.plugin.banners.high || this.props.plugin.banners.low }/>
					</div>;
		}
	},

	renderActions() {
		if ( ! this.props.selectedSite ) {
			return;
		}

		if ( this.props.isPlaceholder ) {
			return;
		}

		if ( this.props.isInstalledOnSite === null )
			return;

		if ( this.props.isInstalledOnSite === false ) {
			return ( <div className="plugin-meta__actions"> { this.getInstallButton() } </div> );
		}

		return (
			<div className="plugin-meta__actions">
				<PluginActivateToggle plugin={ this.props.plugin } site={ this.props.selectedSite } notices={ this.props.notices } isMock={ this.props.isMock } />
				<PluginAutoupdateToggle plugin={ this.props.plugin } site={ this.props.selectedSite } notices={ this.props.notices } wporg={ this.props.plugin.wporg } isMock={ this.props.isMock } />
				<PluginRemoveButton plugin={ this.props.plugin } site={ this.props.selectedSite } notices={ this.props.notices } isMock={ this.props.isMock } />
				{ this.renderSettingsLink() }
			</div>
		);
	},

	renderSettingsLink() {
		if ( ! this.props.plugin ||
				! this.props.plugin.wp_admin_settings_page_url ||
				! this.props.plugin.active ||
				! this.props.selectedSite ) {
			return;
		}

		const isInProgress = PluginsLog.isInProgressAction( this.props.selectedSite.ID, this.props.plugin.slug, [
			'ACTIVATE_PLUGIN',
			'DEACTIVATE_PLUGIN'
		] );

		if ( isInProgress ) {
			return;
		}

		return <PluginSettingsLink linkUrl={ this.props.plugin.wp_admin_settings_page_url } />;
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
		const linkToAuthor = <a className="plugin-meta__author" href={ safeProtocolUrl( this.props.plugin.author_url ) }>{ this.props.plugin.author_name }</a>;

		return this.translate( 'By {{linkToAuthor/}}', {
			components: {
				linkToAuthor
			}
		} );
	},

	getInstallButton() {
		if ( this.hasInstallButton() ) {
			return <PluginInstallButton { ...this.props } />;
		}
	},

	isOutOfDate() {
		if ( this.props.plugin && this.props.plugin.last_updated ) {
			let lastUpdated = this.moment( this.props.plugin.last_updated, 'YYYY-MM-DD' );
			return this.moment().diff( lastUpdated, 'years' ) >= this.OUT_OF_DATE_YEARS;
		}
		return false;
	},

	getVersionWarning() {
		const newVersions = this.getAvailableNewVersions();
		if ( this.isOutOfDate() && newVersions.length === 0 ) {
			return <Notice
				className="plugin-meta__version-notice"
				text={ this.translate( 'This plugin hasn\'t been updated in over 2 years. It may no longer be maintained or supported and may have compatibility issues when used with more recent versions of WordPress' ) }
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
							{ i18n.translate( 'Update to %(newPluginVersion)s', { args: { newPluginVersion: newVersions[ 0 ].newVersion } } ) }
						</NoticeAction>
					</Notice>
				);
			}
			const noticeMessage = newVersions.length > 1
				? i18n.translate( 'Version %(newPluginVersion)s is available for %(numberOfSites)s sites', { args: { numberOfSites: newVersions.length, newPluginVersion: this.props.plugin.version } } )
				: i18n.translate( 'Version %(newPluginVersion)s is available for %(siteName)s', { args: { siteName: newVersions[0].title, newPluginVersion: this.props.plugin.version } } );
			const noticeActionMessage = newVersions.length > 1
				? i18n.translate( 'Update all' )
				: i18n.translate( 'Update' )
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

	hasInstallButton() {
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
			'has-button': this.hasInstallButton(),
			'has-site': !! this.props.selectedSite,
			'is-placeholder': !! this.props.isPlaceholder
		} );

		const plugin = this.props.selectedSite && this.props.sites[ 0 ] ? this.props.sites[ 0 ].plugin : this.props.plugin;

		return (
			<div>
				<Card className="plugin-meta">
					{ this.displayBanner() }
					<div className={ cardClasses } >
						<div className="plugin-meta__detail">
							<PluginIcon image={ this.props.plugin && this.props.plugin.icon } isPlaceholder={ this.props.isPlaceholder } />
							{ this.renderName() }
							<div className="plugin-meta__meta">
								{ this.renderAuthorUrl() }
							</div>
						</div>
						{ this.renderActions() }
					</div>
					{ ! this.props.isMock && <PluginInformation
						plugin={ this.props.plugin }
						isPlaceholder={ this.props.isPlaceholder }
						site={ this.props.selectedSite }
						pluginVersion={ plugin && plugin.version }
						siteVersion={ this.props.selectedSite && this.props.selectedSite.options.software_version }
						hasUpdate={ this.getAvailableNewVersions().length > 0 } /> }

				</Card>
				{ this.getVersionWarning() }
				{ this.getUpdateWarning() }
			</div>
		);
	}
} );
