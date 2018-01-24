/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import ActivityLogRewindToggle from 'my-sites/stats/activity-log/activity-log-rewind-toggle';
import { getSelectedSiteSlug } from 'state/ui/selectors';
import { getRewindState } from 'state/selectors';

class ActivityLogSwitch extends Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,

		// Connected props
		siteSlug: PropTypes.string.isRequired,
		rewindState: PropTypes.string.isRequired,
		failureReason: PropTypes.string.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	state = {
		dismissed: false,
	};

	/**
	 * Dismiss the dialog forever.
	 *
	 * @returns {undefined}
	 */
	// ToDo: replace with real method to dismiss and store in server
	noThanksDismissIt = () => this.setState( { dismissed: true } );

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
					<ActivityLogRewindToggle
						siteId={ siteId }
						label={ translate( 'Switch now' ) }
					/>
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

	render() {
		const { rewindState } = this.props;
		const isDismissed = this.state.dismissed;

		if ( isDismissed || includes( [ 'uninitialized', 'active', 'awaitingCredentials', 'provisioning' ], rewindState ) ) {
			return false;
		}

		const { translate } = this.props;

		return (
			<Card
				className="activity-log-switch"
				>
				<h2 className="activity-log-switch__heading">
					{ translate( 'Welcome to the new Jetpack backups and security system' ) }
				</h2>
				<p>
					{ translate(
						'Our team has been hard at work building a system to backup and secure your site seamlessly.'
					) }
					<br />
					{ translate(
						"Now you will be able to see all your site's activity right from WordPress.com's dashboard."
					) }
				</p>
				{ this.getMainButton() }
				<div>
					<Button
						borderless
						onClick={ this.noThanksDismissIt }
						>
						{ translate( 'No thanks' ) }
					</Button>
				</div>
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
		};
	}
)( localize( ActivityLogSwitch ) );
