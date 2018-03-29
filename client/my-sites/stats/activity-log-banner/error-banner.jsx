/** @format */
/**
 * External dependencies
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { isUndefined } from 'lodash';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';
import HappychatButton from 'components/happychat/button';
import Gridicon from 'gridicons';
import TrackComponentView from 'lib/analytics/track-component-view';
import { recordTracksEvent } from 'state/analytics/actions';

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

		// localize
		translate: PropTypes.func.isRequired,
	};

	static defaultProps = {
		errorCode: '',
		failureReason: '',
		downloadId: undefined,
	};

	handleClickRestart = () => {
		const { siteId, downloadId, createBackup } = this.props;

		return createBackup( siteId, downloadId );
	};

	handleDismiss = () => this.props.closeDialog( 'backup' );

	render() {
		const { translate, downloadId, trackHappyChatBackup } = this.props;
		const strings = {
			title: translate( 'Problem creating a backup' ),
			details: translate( 'We came across a problem creating a backup for your site.' ),
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
					eventProperties={ {
						error_code: 'backup',
						failure_reason: 'backup failed',
						download_id: downloadId,
					} }
				/>
				<p>{ strings.details }</p>
				<Button primary onClick={ this.handleClickRestart }>
					{ translate( 'Try again' ) }
				</Button>
				<HappychatButton
					className="activity-log-banner__error-happychat activity-log-confirm-dialog__more-info-link"
					onClick={ trackHappyChatBackup }
				>
					<Gridicon icon="chat" />
					<span className="activity-log-banner__error-happychat-text activity-log-confirm-dialog__more-info-link-text">
						{ translate( 'Get help' ) }
					</span>
				</HappychatButton>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	trackHappyChatBackup: () => recordTracksEvent( 'calypso_activitylog_error_banner_backup' ),
} )( localize( ErrorBanner ) );
