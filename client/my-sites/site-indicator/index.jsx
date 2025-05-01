import { Button, Gridicon, ExternalLink } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import Animate from 'calypso/components/animate';
import QuerySiteConnectionStatus from 'calypso/components/data/query-site-connection-status';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import { composeAnalytics, recordTracksEvent } from 'calypso/state/analytics/actions';
import isJetpackConnectionUnhealthy from 'calypso/state/jetpack-connection-health/selectors/is-jetpack-connection-unhealthy';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { getUpdatesBySiteId, isJetpackSite } from 'calypso/state/sites/selectors';

import './style.scss';

const WPAdminLink = ( props ) => <ExternalLink icon iconSize={ 12 } target="_blank" { ...props } />;

export class SiteIndicator extends Component {
	static propTypes = {
		site: PropTypes.object,

		// connected props
		siteIsJetpack: PropTypes.bool,
		siteUpdates: PropTypes.object,
		siteIsConnected: PropTypes.bool,
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
			( ( ! siteIsAutomatedTransfer && this.hasUpdate() ) || this.hasError() )
		);
	}

	toggleExpand = () => {
		this.setState( {
			expand: ! this.state.expand,
		} );
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
								link: <a href={ activityLogPath } onClick={ this.resetWindowState } />,
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
					<a onClick={ this.resetWindowState } href={ activityLogPath }>
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
					<a onClick={ this.resetWindowState } href={ activityLogPath }>
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
					<a onClick={ this.resetWindowState } href={ activityLogPath }>
						{ translate( 'There are updates available.' ) }
					</a>
				</span>
			);
		}

		return (
			<span>
				<WPAdminLink href={ site.options?.admin_url + 'update-core.php' }>
					{ translate( 'There is an update available.', 'There are updates available.', {
						count: siteUpdates.total,
					} ) }
				</WPAdminLink>
			</span>
		);
	}

	resetWindowState = () => {
		window.scrollTo( 0, 0 );
		this.setState( { expand: false } );
	};

	handleJetpackConnectionHealthSidebarLinkClick = () => {
		const { siteIsAutomatedTransfer } = this.props;
		this.props.recordTracksEvent( 'calypso_jetpack_connection_health_issue_sidebar_click', {
			is_atomic: siteIsAutomatedTransfer,
		} );
	};

	errorAccessing() {
		const { site, translate, siteIsAutomatedTransfer } = this.props;

		// Don't show the button if the site is not defined.
		if ( site ) {
			return (
				<span>
					<TrackComponentView
						eventName="calypso_jetpack_connection_health_issue_sidebar_view"
						eventProperties={ {
							is_atomic: siteIsAutomatedTransfer,
						} }
					/>
					{ translate( 'Jetpack can’t communicate with your site.' ) }
					<Button
						plain
						href="https://jetpack.com/support/reconnecting-reinstalling-jetpack/"
						target="_blank"
						onClick={ this.handleJetpackConnectionHealthSidebarLinkClick }
					>
						{ translate( 'Learn how to fix' ) }
					</Button>
				</span>
			);
		}

		return <span>{ translate( 'This site cannot be accessed.' ) }</span>;
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
		const indicatorClass = clsx( {
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
						<button
							data-testid="site-indicator-button"
							className="site-indicator__button"
							onClick={ this.toggleExpand }
						>
							{ /* eslint-disable wpcalypso/jsx-gridicon-size */ }
							<Gridicon icon={ this.getIcon() } size={ 16 } />
							{ /* eslint-enable wpcalypso/jsx-gridicon-size */ }
						</button>
					</Animate>
				) }
				{ this.state.expand && (
					<div data-testid="site-indicator-message" className="site-indicator__message">
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
			siteIsConnected: site && ! isJetpackConnectionUnhealthy( state, site.ID ),
			siteIsJetpack: site && isJetpackSite( state, site.ID ),
			siteIsAutomatedTransfer: site && isSiteAutomatedTransfer( state, site.ID ),
			siteUpdates: site && getUpdatesBySiteId( state, site.ID ),
			userCanManage: site && canCurrentUser( state, site.ID, 'manage_options' ),
		};
	},
	{
		recordTracksEvent,
		trackSiteDisconnect: () =>
			composeAnalytics( recordTracksEvent( 'calypso_jetpack_site_indicator_disconnect_start' ) ),
	}
)( localize( SiteIndicator ) );
