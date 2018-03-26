/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import config from 'config';
import classNames from 'classnames';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import Button from 'components/button';
import ExternalLink from 'components/external-link';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import QuerySiteConnectionStatus from 'components/data/query-site-connection-status';
import { getUpdatesBySiteId, isJetpackSite } from 'state/sites/selectors';
import {
	canCurrentUser,
	getSiteConnectionStatus,
	isRequestingSiteConnectionStatus,
	isSiteAutomatedTransfer,
} from 'state/selectors';

const WPAdminLink = props => <ExternalLink icon iconSize={ 12 } target="_blank" { ...props } />;

class SiteIndicator extends Component {
	static propTypes = {
		site: PropTypes.object,

		// connected props
		siteIsJetpack: PropTypes.bool,
		siteUpdates: PropTypes.object,
		siteIsConnected: PropTypes.bool,
		requestingConnectionStatus: PropTypes.bool,
		recordGoogleEvent: PropTypes.func,
		recordTracksEvent: PropTypes.func,
	};

	state = { expand: false };

	hasUpdate() {
		const { siteUpdates } = this.props;
		return siteUpdates && ! this.hasError() && siteUpdates.total > 0;
	}

	hasError() {
		return this.props.siteIsConnected === false;
	}

	hasWarning() {
		const { requestingConnectionStatus, site, siteIsConnected, siteIsJetpack } = this.props;

		if ( siteIsJetpack && ! site.hasMinimumJetpackVersion ) {
			if ( requestingConnectionStatus ) {
				return false;
			}

			return siteIsConnected;
		}

		return false;
	}

	showIndicator() {
		const { siteIsAutomatedTransfer, siteIsJetpack, userCanManage } = this.props;

		// Until WP.com sites have indicators (upgrades expiring, etc) we only show them for Jetpack sites
		return (
			userCanManage &&
			siteIsJetpack &&
			! siteIsAutomatedTransfer &&
			( this.hasUpdate() || this.hasError() || this.hasWarning() )
		);
	}

	toggleExpand = () => {
		this.setState( {
			expand: ! this.state.expand,
		} );

		const action = ! this.state.expand ? 'Expand' : 'Collapse';
		this.props.recordGoogleEvent( 'Site-Indicator', `Clicked to ${ action } the Site Indicator` );
	};

	updatesAvailable() {
		const { site, siteUpdates, translate } = this.props;
		if ( siteUpdates.wordpress && siteUpdates.wp_update_version ) {
			return (
				<span>
					{ translate(
						'A newer version of WordPress is available. {{link}}Update to %(version)s{{/link}}',
						{
							components: {
								link: (
									<WPAdminLink
										onClick={ this.handleCoreUpdate }
										href={ site.options.admin_url + 'update-core.php' }
									/>
								),
							},
							args: {
								version: siteUpdates.wp_update_version,
							},
						}
					) }
				</span>
			);
		}

		if ( siteUpdates.plugins === siteUpdates.total && site.canUpdateFiles ) {
			return (
				<span>
					<a onClick={ this.handlePluginsUpdate } href={ '/plugins/updates/' + site.slug }>
						{ translate(
							'There is a plugin update available.',
							'There are plugin updates available.',
							{
								count: siteUpdates.total,
							}
						) }
					</a>
				</span>
			);
		}

		return (
			<span>
				<WPAdminLink
					onClick={ this.handleGenericUpdate }
					href={ site.options.admin_url + 'update-core.php' }
				>
					{ translate( 'There is an update available.', 'There are updates available.', {
						count: siteUpdates.total,
					} ) }
				</WPAdminLink>
			</span>
		);
	}

	handlePluginsUpdate = () => {
		const { siteUpdates } = this.props;
		window.scrollTo( 0, 0 );
		this.setState( { expand: false } );
		this.props.recordGoogleEvent(
			'Site-Indicator',
			'Clicked updates available link to plugins updates',
			'Total Updates',
			siteUpdates && siteUpdates.total
		);
	};

	handleCoreUpdate = () => {
		this.props.recordGoogleEvent(
			'Site-Indicator',
			'Triggered Update WordPress Core Version From Calypso'
		);
	};

	// General case with updates of multiple types (plugins, themes, translations, ...) available
	handleGenericUpdate = () => {
		const { siteUpdates } = this.props;
		this.props.recordGoogleEvent(
			'Site-Indicator',
			'Clicked updates available link to wp-admin updates',
			'Total Updates',
			siteUpdates && siteUpdates.total
		);
	};

	handleJetpackUpdate = () => {
		this.props.recordGoogleEvent( 'Site-Indicator', 'Clicked Update Jetpack Now Link' );
	};

	unsupportedJetpackVersion() {
		const { translate } = this.props;
		return (
			<span>
				{ translate( 'Jetpack %(version)s is required. {{link}}Update now{{/link}}', {
					args: {
						version: config( 'jetpack_min_version' ),
					},
					components: {
						link: (
							<WPAdminLink
								onClick={ this.handleJetpackUpdate }
								href={ this.props.site.options.admin_url + 'plugins.php?plugin_status=upgrade' }
							/>
						),
					},
				} ) }
			</span>
		);
	}

	errorAccessing() {
		const { site, translate } = this.props;
		let accessFailedMessage;

		// Don't show the button if the site is not defined.
		if ( site ) {
			accessFailedMessage = (
				<span>
					{ translate( 'This site cannot be accessed.' ) }
					<Button
						borderless
						compact
						scary
						href={ `/settings/disconnect-site/${ site.slug }` }
						onClick={ this.props.trackSiteDisconnect }
					>
						{ translate( 'Remove Site' ) }
					</Button>
				</span>
			);
		} else {
			accessFailedMessage = <span>{ translate( 'This site cannot be accessed.' ) }</span>;
		}

		return accessFailedMessage;
	}

	getText() {
		if ( this.hasWarning() ) {
			return this.unsupportedJetpackVersion();
		}

		if ( this.hasUpdate() ) {
			return this.updatesAvailable();
		}

		if ( this.hasError() ) {
			return this.errorAccessing();
		}

		return null;
	}

	getIcon() {
		if ( this.hasWarning() ) {
			return 'notice';
		}

		if ( this.hasUpdate() ) {
			return 'sync';
		}

		if ( this.hasError() ) {
			return 'notice';
		}
	}

	renderIndicator() {
		const indicatorClass = classNames( {
			'is-expanded': this.state.expand,
			'is-update': this.hasUpdate(),
			'is-warning': this.hasWarning(),
			'is-error': this.hasError(),
			'is-action': true,
			'site-indicator__main': true,
		} );

		return (
			<div className={ indicatorClass }>
				{ ! this.state.expand && (
					<Animate type="appear">
						<button className="site-indicator__button" onClick={ this.toggleExpand }>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon={ this.getIcon() } size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
						</button>
					</Animate>
				) }
				{ this.state.expand && (
					<div className="site-indicator__message">
						<div className="site-indicator__action">{ this.getText() }</div>
						<button className="site-indicator__button" onClick={ this.toggleExpand }>
							<Animate type="appear">
								<Gridicon icon="cross" size={ 18 } />
							</Animate>
						</button>
					</div>
				) }
			</div>
		);
	}

	render() {
		const { site, siteIsJetpack } = this.props;

		return (
			<div className="site-indicator__wrapper">
				{ siteIsJetpack && <QuerySiteConnectionStatus siteId={ site.ID } /> }

				{ this.showIndicator() && this.renderIndicator() }
			</div>
		);
	}
}

export default connect(
	( state, { site } ) => {
		return {
			requestingConnectionStatus: site && isRequestingSiteConnectionStatus( state, site.ID ),
			siteIsConnected: site && getSiteConnectionStatus( state, site.ID ),
			siteIsJetpack: site && isJetpackSite( state, site.ID ),
			siteIsAutomatedTransfer: site && isSiteAutomatedTransfer( state, site.ID ),
			siteUpdates: site && getUpdatesBySiteId( state, site.ID ),
			userCanManage: site && canCurrentUser( state, site.ID, 'manage_options' ),
		};
	},
	{
		recordGoogleEvent,
		recordTracksEvent,
		trackSiteDisconnect: () =>
			composeAnalytics(
				recordGoogleEvent(
					'Jetpack',
					'Clicked in site indicator to start Jetpack Disconnect flow'
				),
				recordTracksEvent( 'calypso_jetpack_site_indicator_disconnect_start' )
			),
	}
)( localize( SiteIndicator ) );
