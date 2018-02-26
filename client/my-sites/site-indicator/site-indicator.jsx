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
import ProgressIndicator from 'components/progress-indicator';
import Button from 'components/button';
import analytics from 'lib/analytics';
import { composeAnalytics, recordGoogleEvent, recordTracksEvent } from 'state/analytics/actions';
import QuerySiteConnectionStatus from 'components/data/query-site-connection-status';
import { isJetpackSite } from 'state/sites/selectors';
import { getUpdatesBySiteId } from 'state/sites/updates/selectors';
import { updateWordPress } from 'state/sites/updates/actions';
import {
	canCurrentUser,
	getSiteConnectionStatus,
	isRequestingSiteConnectionStatus,
	isSiteAutomatedTransfer,
	isWordpressUpdateSuccessful,
} from 'state/selectors';

class SiteIndicator extends Component {
	static propTypes = {
		site: PropTypes.object,

		// connected props
		siteIsJetpack: PropTypes.bool,
		siteUpdates: PropTypes.object,
		siteIsConnected: PropTypes.bool,
		requestingConnectionStatus: PropTypes.bool,
		recordTracksEvent: PropTypes.func,
		withAnalytics: PropTypes.func,
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
			( this.hasUpdate() || this.hasError() || this.hasWarning() || this.state.updateError )
		);
	}

	toggleExpand = () => {
		this.setState( {
			updateError: false,
			updateSucceed: false,
			expand: ! this.state.expand,
		} );

		const action = ! this.state.expand ? 'Expand' : 'Collapse';
		analytics.ga.recordEvent( 'Site-Indicator', `Clicked to ${ action } the Site Indicator` );
	};

	updatesAvailable() {
		const { site, siteUpdates, translate } = this.props;
		if (
			config.isEnabled( 'jetpack_core_inline_update' ) &&
			siteUpdates.wordpress &&
			siteUpdates.wp_update_version
		) {
			return (
				<span>
					{ translate(
						'A newer version of WordPress is available. {{link}}Update to %(version)s{{/link}}',
						{
							components: {
								link: (
									<a
										onClick={ this.handleUpdate }
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

		const recordEvent = analytics.ga.recordEvent.bind(
			analytics,
			'Site-Indicator',
			'Clicked updates available link to wp-admin updates',
			'Total Updates',
			siteUpdates && siteUpdates.total
		);

		return (
			<span>
				<a onClick={ recordEvent } href={ site.options.admin_url + 'update-core.php' }>
					{ translate( 'There is an update available.', 'There are updates available.', {
						count: siteUpdates.total,
					} ) }
				</a>
			</span>
		);
	}

	onUpdateError = () => {
		this.setState( {
			expand: true,
			updating: false,
			updateError: true,
		} );
	};

	onUpdateSuccess = () => {
		this.setState( {
			updating: false,
			updateSucceed: true,
		} );

		this.timer = setTimeout( () => {
			this.setState( { updateSucceed: false } );
			this.timer = null;
		}, 15000 );
	};

	handlePluginsUpdate = () => {
		const { siteUpdates } = this.props;
		window.scrollTo( 0, 0 );
		this.setState( { expand: false } );
		analytics.ga.recordEvent(
			'Site-Indicator',
			'Clicked updates available link to plugins updates',
			'Total Updates',
			siteUpdates && siteUpdates.total
		);
	};

	handleUpdate = () => {
		const { wordpressUpdateSuccessful, site } = this.props;

		this.setState( {
			updating: true,
			expand: false,
		} );

		this.timer != null ? clearTimeout( this.timer ) : null;

		this.props.updateWordPress( site.ID ).then( () => {
			if ( wordpressUpdateSuccessful ) {
				this.onUpdateSuccess();
			} else {
				this.onUpdateError();
			}
		} );

		analytics.ga.recordEvent(
			'site-indicator',
			'Triggered Update WordPress Core Version From Calypso'
		);
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
							<a
								onClick={ this.makeAnalyticsRecordEventHandler(
									'Clicked Update Jetpack Now Link'
								) }
								href={ this.props.site.options.admin_url + 'plugins.php?plugin_status=upgrade' }
							/>
						),
					},
				} ) }
			</span>
		);
	}

	makeAnalyticsRecordEventHandler = action => {
		return () => {
			analytics.ga.recordEvent( 'Site-Indicator', action );
		};
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

	errorUpdating() {
		const { translate } = this.props;

		return (
			<span>
				{ translate( 'There was a problem updating. {{link}}Update on site{{/link}}.', {
					components: {
						link: (
							<a
								href={ this.props.site.options.admin_url + 'update-core.php' }
								onClick={ this.makeAnalyticsRecordEventHandler( 'Clicked Update On Site Link' ) }
							/>
						),
					},
				} ) }
			</span>
		);
	}

	getText() {
		if ( this.state.updateError ) {
			return this.errorUpdating();
		}

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

	renderUpdateProgress() {
		let progressStatus;

		if ( this.state.updating ) {
			progressStatus = 'processing';
		}
		if ( this.state.updateSucceed ) {
			progressStatus = 'success';
		}

		return (
			<div className="site-indicator__main">
				<ProgressIndicator
					key="update-progress"
					status={ progressStatus }
					className="site-indicator__progress-indicator"
				/>
			</div>
		);
	}

	renderIndicator() {
		if ( this.state.updating || this.state.updateSucceed ) {
			return this.renderUpdateProgress();
		}

		const indicatorClass = classNames( {
			'is-expanded': this.state.expand,
			'is-update': this.hasUpdate(),
			'is-warning': this.hasWarning(),
			'is-error': this.hasError(),
			'is-action': true,
			'site-indicator__main': true,
		} );

		const textClass = classNames( {
			'is-updating': this.state.updating,
			'is-updated': this.state.updateSucceed,
			'site-indicator__action': true,
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
						<div className={ textClass }>{ this.getText() }</div>
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
			wordpressUpdateSuccessful: site && isWordpressUpdateSuccessful( state, site.ID ),
			requestingConnectionStatus: site && isRequestingSiteConnectionStatus( state, site.ID ),
			siteIsConnected: site && getSiteConnectionStatus( state, site.ID ),
			siteIsJetpack: site && isJetpackSite( state, site.ID ),
			siteIsAutomatedTransfer: site && isSiteAutomatedTransfer( state, site.ID ),
			siteUpdates: site && getUpdatesBySiteId( state, site.ID ),
			userCanManage: site && canCurrentUser( state, site.ID, 'manage_options' ),
		};
	},
	{
		updateWordPress,
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
