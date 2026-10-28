import { Button } from '@automattic/components';
import clsx from 'clsx';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import TrackComponentView from 'calypso/lib/analytics/track-component-view';
import {
	dismissRewindBackupProgress,
	dismissRewindRestoreProgress as dismissRewindRestoreProgressAction,
} from 'calypso/state/activity-log/actions';
import {
	goToKnownThreatsRestorePath,
	KnownThreatsRestoreHint,
	withKnownThreatsRestorePath,
} from '../known-threats-restore-gate';
import ActivityLogBanner from './index';

class ErrorBanner extends PureComponent {
	static propTypes = {
		errorCode: PropTypes.string.isRequired,
		failureReason: PropTypes.string.isRequired,
		closeDialog: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.string,
		downloadId: PropTypes.number,
		requestedRestoreId: PropTypes.string,
		createBackup: PropTypes.func,
		rewindRestore: PropTypes.func,
		knownThreatsRestorePath: PropTypes.string,
		knownThreatsCheckPending: PropTypes.bool,
		knownThreatsRestoreHint: PropTypes.string,
		knownThreatsRestoreHintId: PropTypes.string,

		// connect
		dismissRewindRestoreProgress: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		errorCode: '',
		failureReason: '',
		downloadId: undefined,
		requestedRestoreId: undefined,
	};

	handleClickRestart = () => {
		const {
			siteId,
			downloadId,
			requestedRestoreId,
			rewindRestore,
			createBackup,
			knownThreatsRestorePath,
			knownThreatsCheckPending,
		} = this.props;
		if ( downloadId ) {
			return createBackup( siteId, downloadId );
		}
		if ( knownThreatsCheckPending ) {
			return;
		}
		if ( knownThreatsRestorePath ) {
			return goToKnownThreatsRestorePath(
				knownThreatsRestorePath,
				this.props.knownThreatsRestoreHint
			);
		}
		if ( requestedRestoreId ) {
			return rewindRestore( siteId, requestedRestoreId );
		}
	};

	handleDismiss = () =>
		typeof this.props.downloadId === 'undefined'
			? this.props.closeDialog( 'restore' )
			: this.props.dismissDownloadError( this.props.siteId, this.props.downloadId );

	render() {
		const {
			errorCode,
			failureReason,
			timestamp,
			translate,
			downloadId,
			knownThreatsCheckPending,
			knownThreatsRestoreHint,
			knownThreatsRestoreHintId,
		} = this.props;
		const strings =
			typeof downloadId === 'undefined'
				? {
						title: translate( 'Problem restoring your site' ),
						details: translate( 'We came across a problem while trying to restore your site.' ),
					}
				: {
						title: translate( 'Problem preparing your file' ),
						details: translate( 'There was a problem preparing your backup for downloading.' ),
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
						typeof downloadId === 'undefined'
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
				{ /* While pending, stay focusable (aria-disabled) so the description can say why. */ }
				<Button
					primary
					className={ clsx( { disabled: knownThreatsCheckPending } ) }
					busy={ knownThreatsCheckPending }
					aria-disabled={ knownThreatsCheckPending || undefined }
					aria-describedby={ knownThreatsRestoreHint ? knownThreatsRestoreHintId : undefined }
					onClick={ this.handleClickRestart }
				>
					{ translate( 'Try again' ) }
				</Button>
				<KnownThreatsRestoreHint
					id={ knownThreatsRestoreHintId }
					hint={ knownThreatsRestoreHint }
				/>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
	dismissDownloadError: dismissRewindBackupProgress,
} )(
	withKnownThreatsRestorePath( ( { siteId, downloadId, requestedRestoreId } ) => ( {
		siteId,
		rewindId: requestedRestoreId,
		enabled: typeof downloadId === 'undefined' && !! requestedRestoreId,
	} ) )( localize( ErrorBanner ) )
);
