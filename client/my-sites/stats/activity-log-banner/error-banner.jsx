/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';
import TrackComponentView from 'lib/analytics/track-component-view';
import { dismissRewindRestoreProgress as dismissRewindRestoreProgressAction } from 'state/activity-log/actions';

class ErrorBanner extends PureComponent {
	static propTypes = {
		errorCode: PropTypes.string.isRequired,
		failureReason: PropTypes.string.isRequired,
		requestDialog: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.string.isRequired,

		// connect
		dismissRewindRestoreProgress: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		errorCode: '',
		failureReason: '',
	};

	handleClickRestart = () => this.props.requestDialog( this.props.timestamp, 'status', 'restore' );

	handleDismiss = () => this.props.dismissRewindRestoreProgress( this.props.siteId );

	render() {
		const { errorCode, failureReason, timestamp, translate } = this.props;

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="error"
				title={ translate( 'Problem restoring your site' ) }
			>
				<TrackComponentView
					eventName="calypso_activitylog_errorbanner_impression"
					eventProperties={ {
						error_code: errorCode,
						failure_reason: failureReason,
						restore_to: timestamp,
					} }
				/>
				<p>{ translate( 'We came across a problem while trying to restore your site.' ) }</p>
				<Button primary onClick={ this.handleClickRestart }>
					{ translate( 'Try again' ) }
				</Button>
				{ '  ' }
				<Button href="https://help.vaultpress.com/restore-tips-troubleshooting-steps/">
					{ translate( 'Get help' ) }
				</Button>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
} )( localize( ErrorBanner ) );
