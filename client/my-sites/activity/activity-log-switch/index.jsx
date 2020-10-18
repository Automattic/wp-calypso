/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card, Button } from '@automattic/components';
import { getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import { getSiteUrl } from 'calypso/state/sites/selectors';

/**
 * Style dependencies
 */
import './style.scss';

class ActivityLogSwitch extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		redirect: PropTypes.string.isRequired,

		// Connected props
		siteSlug: PropTypes.string.isRequired,
		rewindState: PropTypes.string.isRequired,
		failureReason: PropTypes.string.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	/**
	 * Renders the main button whose functionality and label varies depending on why Jetpack Backup is unavailable.
	 *
	 * @returns {object} Primary button.
	 */
	getMainButton() {
		const { siteId, siteSlug, translate, canAutoconfigure } = this.props;
		switch ( this.props.failureReason ) {
			case 'vp_can_transfer':
				return (
					<Button
						primary
						href={ `/start/rewind-switch/?siteId=${ siteId }&siteSlug=${ siteSlug }` }
					>
						{ translate( 'Switch now' ) }
					</Button>
				);

			case 'missing_plan':
				return (
					<Button primary href={ `/plans/${ siteSlug }` }>
						{ translate( 'Upgrade now' ) }
					</Button>
				);

			case 'awaitingCredentials':
			default:
				return (
					<Button
						primary
						href={
							canAutoconfigure
								? `/start/rewind-auto-config/?blogid=${ siteId }&siteSlug=${ siteSlug }`
								: `/start/rewind-setup/?siteId=${ siteId }&siteSlug=${ siteSlug }`
						}
					>
						{ translate( 'Continue setup' ) }
					</Button>
				);
		}
	}

	render() {
		if ( 'vp_active_on_site' === this.props.failureReason ) {
			return false;
		}

		if ( 'uninitialized' === this.props.rewindState ) {
			return (
				<Card className="activity-log-switch activity-log-switch__placeholder">
					<div className="activity-log-switch__header">
						<div className="activity-log-switch__header-header" />
					</div>
					<div className="activity-log-switch__img-placeholder" />
					<p className="activity-log-switch__header-text" />
				</Card>
			);
		}

		const { translate, redirect, siteUrl } = this.props;

		return (
			<Card className="activity-log-switch">
				<div className="activity-log-switch__header">
					<h2 className="activity-log-switch__header-header">
						{ translate( "Welcome to Jetpack's new backups and security" ) }
					</h2>
					<img src="/calypso/images/illustrations/security.svg" alt="" />
					<p className="activity-log-switch__header-text">
						{ translate(
							'Backing up and securing your site should be a breeze. ' +
								"Our new seamless system makes it possible to see all your site's activity from one convenient dashboard."
						) }
					</p>
					{ this.getMainButton() }
					<div>
						<a className="activity-log-switch__no-thanks" href={ `${ siteUrl }${ redirect }` }>
							{ translate( 'No thanks' ) }
						</a>
					</div>
				</div>
				<h3 className="activity-log-switch__features-header">
					{ translate( 'What else can it do?' ) }
				</h3>
				<Card className="activity-log-switch__feature">
					<h4 className="activity-log-switch__feature-heading">
						{ translate( 'Restore to any event' ) }
					</h4>
					<div className="activity-log-switch__feature-content">
						<p>
							{ translate(
								'As soon as you switch over, we will start tracking every change made ' +
									'to your site and allow you to restore to any past event. ' +
									'If you lose a file, get hacked, or just liked your site better before some changes, ' +
									'you can restore with a click of a button.'
							) }
						</p>
					</div>
					<img
						className="activity-log-switch__img is-backup"
						src="/calypso/images/illustrations/backup.svg"
						alt=""
					/>
				</Card>
				<Card className="activity-log-switch__feature">
					<h4 className="activity-log-switch__feature-heading">
						{ translate( "Stay on top of your site's security" ) }
					</h4>
					<div className="activity-log-switch__feature-content">
						<p>
							{ translate(
								'When something happens to your website you want to know it immediately. ' +
									"And you will—we'll send you instant alerts based on our 24/7 monitoring of advanced threats."
							) }
						</p>
					</div>

					<img
						className="activity-log-switch__img is-security-issue"
						src="/calypso/images/illustrations/security-issue.svg"
						alt=""
					/>
				</Card>
				<Card className="activity-log-switch__feature">
					<h4 className="activity-log-switch__feature-heading">
						{ translate( 'Log all events on your site' ) }
					</h4>
					<div className="activity-log-switch__feature-content">
						<p>
							{ translate(
								'Access a new, streamlined history of events on your site—from published posts to user-role changes. ' +
									'If you ever need to figure out what happened when, now you can get the answer in seconds.'
							) }
						</p>
					</div>
					<img
						className="activity-log-switch__img is-stats"
						src="/calypso/images/illustrations/stats.svg"
						alt=""
					/>
				</Card>
			</Card>
		);
	}
}

export default connect( ( state, { siteId } ) => {
	const rewindState = getRewindState( state, siteId );
	return {
		siteSlug: getSelectedSiteSlug( state, siteId ),
		siteUrl: getSiteUrl( state, siteId ),
		rewindState: rewindState.state,
		failureReason: rewindState.reason || '',
		canAutoconfigure: rewindState.canAutoconfigure,
	};
} )( localize( ActivityLogSwitch ) );
