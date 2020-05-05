/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import classNames from 'classnames';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import Animate from 'components/animate';
import { Button } from '@automattic/components';
import ExternalLink from 'components/external-link';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import QuerySiteConnectionStatus from 'components/data/query-site-connection-status';
import { getUpdatesBySiteId, isJetpackSite } from 'state/sites/selectors';
import canCurrentUser from 'state/selectors/can-current-user';
import getSiteConnectionStatus from 'state/selectors/get-site-connection-status';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';

/**
 * Style dependencies
 */
import './style.scss';

const WPAdminLink = ( props ) => <ExternalLink icon iconSize={ 12 } target="_blank" { ...props } />;

class SiteIndicator extends Component {
	static propTypes = {
		site: PropTypes.object,

		// connected props
		siteIsJetpack: PropTypes.bool,
		siteUpdates: PropTypes.object,
		siteIsConnected: PropTypes.bool,
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

	showIndicator() {
		const { siteIsAutomatedTransfer, siteIsJetpack, userCanManage } = this.props;

		// Until WP.com sites have indicators (upgrades expiring, etc) we only show them for Jetpack sites
		return (
			userCanManage &&
			siteIsJetpack &&
			! siteIsAutomatedTransfer &&
			( this.hasUpdate() || this.hasError() )
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
		const activityLogPath = '/activity-log/' + site.slug;

		if ( siteUpdates.wordpress === siteUpdates.total && site.canUpdateFiles ) {
			return (
				<span>
					{ translate(
						'A newer version of WordPress is available. {{link}}Update to %(version)s{{/link}}',
						{
							components: {
								link: <a href={ activityLogPath } onClick={ this.handleCoreUpdate } />,
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
					<a onClick={ this.handlePluginsUpdate } href={ activityLogPath }>
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

		if ( siteUpdates.themes === siteUpdates.total && site.canUpdateFiles ) {
			return (
				<span>
					<a onClick={ this.handleThemesUpdate } href={ activityLogPath }>
						{ translate(
							'There is a theme update available.',
							'There are theme updates available.',
							{
								count: siteUpdates.total,
							}
						) }
					</a>
				</span>
			);
		}
		// Everything else expect for translations since they are not supported
		if (
			siteUpdates.themes + siteUpdates.plugins + siteUpdates.wordpress === siteUpdates.total &&
			site.canUpdateFiles
		) {
			return (
				<span>
					<a onClick={ this.handleMultipleUpdate } href={ activityLogPath }>
						{ translate( 'There are updates available.' ) }
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

	recordEvent( event, total ) {
		window.scrollTo( 0, 0 );
		this.setState( { expand: false } );
		this.props.recordGoogleEvent( 'Site-Indicator', event, 'Total Updates', total );
	}

	handlePluginsUpdate = () => {
		const { siteUpdates } = this.props;
		this.recordEvent(
			'Clicked updates available link to plugins updates',
			siteUpdates && siteUpdates.total
		);
	};

	handleThemesUpdate = () => {
		const { siteUpdates } = this.props;
		this.recordEvent(
			'Clicked updates available link to theme updates',
			siteUpdates && siteUpdates.total
		);
	};

	handleCoreUpdate = () => {
		this.recordEvent( 'Clicked updates available link to WordPress updates', 1 );
	};

	handleMultipleUpdate = () => {
		const { siteUpdates } = this.props;
		this.recordEvent(
			'Clicked updates available link for multiple updates',
			siteUpdates && siteUpdates.total
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
		if ( this.hasUpdate() ) {
			return this.updatesAvailable();
		}

		if ( this.hasError() ) {
			return this.errorAccessing();
		}

		return null;
	}

	getIcon() {
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
			/* eslint-disable wpcalypso/jsx-classname-namespace */
			<div className="site-indicator__wrapper">
				{ siteIsJetpack && <QuerySiteConnectionStatus siteId={ site.ID } /> }

				{ this.showIndicator() && this.renderIndicator() }
			</div>
			/* eslint-enable wpcalypso/jsx-classname-namespace */
		);
	}
}

export default connect(
	( state, { site } ) => {
		return {
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
