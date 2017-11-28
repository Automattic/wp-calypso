/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isEmpty } from 'lodash';

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
		closeDialog: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.string,
		downloadId: PropTypes.number,
		requestedRestoreActivityId: PropTypes.number,
		createBackup: PropTypes.func,
		rewindRestore: PropTypes.func,
		rewindId: PropTypes.number,

		// connect
		dismissRewindRestoreProgress: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		errorCode: '',
		failureReason: '',
		downloadId: undefined,
		requestedRestoreActivityId: undefined,
	};

	handleClickRestart = () => {
		const {
			siteId,
			downloadId,
			requestedRestoreActivityId,
			rewindRestore,
			createBackup,
		} = this.props;
		if ( requestedRestoreActivityId ) {
			rewindRestore( siteId, requestedRestoreActivityId );
		} else if ( downloadId ) {
			createBackup( siteId, downloadId );
		}
	};

	handleDismiss = () =>
		isEmpty( this.props.downloadId )
			? this.props.closeDialog( 'restore' )
			: this.props.closeDialog( 'backup' );

	render() {
		const { errorCode, failureReason, timestamp, translate, downloadId } = this.props;
		const strings = isEmpty( downloadId )
			? {
					title: translate( 'Problem restoring your site' ),
					details: translate( 'We came across a problem while trying to restore your site.' ),
				}
			: {
					title: translate( 'Problem creating a backup' ),
					details: (
						<span>
							{ translate( 'We came across a problem creating a backup for your site.' ) }
							<br />
							<code>{ errorCode }</code>
						</span>
					),
				};

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="error"
				title={ strings.title }
			>
				<TrackComponentView
					eventName="calypso_activitylog_errorbanner_impression"
					eventProperties={
						isEmpty( downloadId )
							? {
									error_code: errorCode,
									failure_reason: failureReason,
									restore_to: timestamp,
								}
							: {
									error_code: 'backup',
									failure_reason: 'backup failed',
									download_id: downloadId,
								}
					}
				/>
				<p>{ strings.details }</p>
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
