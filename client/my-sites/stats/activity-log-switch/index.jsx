/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';
import page from 'page';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { getRewindState, isRewindActive } from 'state/selectors';

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
	 * Renders the main button whose functionality and label varies depending on why Rewind is unavailable.
	 *
	 * @returns {object} Primary button.
	 */
	getMainButton() {
		const {
			siteId,
			siteSlug,
			translate,
		} = this.props;
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
					<Button
						primary
						href={ `/plans/${ siteSlug }` }
					>
						{ translate( 'Upgrade now' ) }
					</Button>
				);

			default:
				return (
					<Button
						primary
						href={ `/settings/security/${ siteSlug }` }
						>
						{ translate( 'Continue setup' ) }
					</Button>
				);
		}
	}

	/**
	 * Before component updates, check if we have to go somewhere else.
	 * If Rewind was activated, user clicked the Switch now button so let's go to migrate creds.
	 *
	 * @param {object} nextProps Props received by component for next update.
	 */
	componentWillUpdate( nextProps ) {
		if ( this.props.rewindIsActive !== nextProps.rewindIsActive ) {
			page( `/start/rewind-migrate/${ this.props.siteSlug }` );
		}
	}

	render() {
		if (
			'vp_active_on_site' === this.props.failureReason ||
			includes( [ 'uninitialized', 'active', 'awaitingCredentials', 'provisioning' ], this.props.rewindState )
		) {
			return false;
		}

		const {
			translate,
			redirect,
			siteSlug,
		} = this.props;

		return (
			<Card className="activity-log-switch">
				<h2 className="activity-log-switch__heading">
					{ translate( "Welcome to Jetpack's new backups and security" ) }
				</h2>
				<img src="/calypso/images/illustrations/security.svg" alt="" />
				<p className="activity-log-switch__intro">
					{ translate(
						'Backing up and securing your site should be a breeze. ' +
						"Our new seamless system makes it possible to see all your site's activity from one convenient dashboard."
					) }
				</p>
				{ this.getMainButton() }
				<div>
					<a href={ `//${ siteSlug }/wp-admin/${ redirect }` }>
						{ translate( 'No thanks' ) }
					</a>
				</div>
				<h3 className="activity-log-switch__heading-more">
					{ translate( 'What else can it do?' ) }
				</h3>
				<Card className="activity-log-switch__feature">
					<div className="activity-log-switch__feature-content">
						<h4 className="activity-log-switch__feature-heading">
							{ translate( 'Rewind to any event' ) }
						</h4>
						<p>
							{ translate(
								'As soon as you switch over, we will start tracking every change made ' +
								'to your site and allow you to rewind to any past event. ' +
								'If you lose a file, get hacked, or just liked your site better before some changes, ' +
								'you can rewind with a click of a button.'
							) }
						</p>
					</div>
					<img src="/calypso/images/illustrations/backup.svg" alt="" />
				</Card>
				<Card className="activity-log-switch__feature">
					<div className="activity-log-switch__feature-content">
						<h4 className="activity-log-switch__feature-heading">
							{ translate( "Stay on top of your site's security" ) }
						</h4>
						<p>
							{ translate(
								'When something happens to your website you want to know it immediately. ' +
								"And you will—we'll send you instant alerts based on our 24/7 monitoring of advanced threats."
							) }
						</p>
					</div>
					<img src="/calypso/images/illustrations/security-issue.svg" alt="" />
				</Card>
				<Card className="activity-log-switch__feature">
					<div className="activity-log-switch__feature-content">
						<h4 className="activity-log-switch__feature-heading">
							{ translate( 'Log all events on your site' ) }
						</h4>
						<p>
							{ translate(
								'Access a new, streamlined history of events on your site—from published posts to user-role changes. ' +
								'If you ever need to figure out what happened when, now you can get the answer in seconds.'
							) }
						</p>
					</div>
					<img src="/calypso/images/illustrations/stats.svg" alt="" />
				</Card>
			</Card>
		);
	}
}

export default connect(
	( state, { siteId } ) => {
		const rewindState = getRewindState( state, siteId );
		return {
			siteSlug: getSelectedSiteSlug( state, siteId ),
			rewindState: rewindState.state,
			failureReason: rewindState.failureReason || '',
			rewindIsActive: isRewindActive( state, siteId ),
		};
	}
)( localize( ActivityLogSwitch ) );
