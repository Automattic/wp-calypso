/**
 * External dependencies
 */
import React, { PropTypes, PureComponent } from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';
import { dismissRewindRestoreProgress as dismissRewindRestoreProgressAction } from 'state/activity-log/actions';

class ErrorBanner extends PureComponent {
	static propTypes = {
		requestRestore: PropTypes.func.isRequired,
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.number.isRequired,

		// connect
		dismissRewindRestoreProgress: PropTypes.func.isRequired,

		// localize
		translate: PropTypes.func.isRequired,
	};

	handleClickRestore = () => this.props.requestRestore( this.props.timestamp );

	handleDismiss = () => this.props.dismissRewindRestoreProgress( this.props.siteId );

	render() {
		const { translate } = this.props;

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="error"
				title={ translate( 'Problem restoring your site' ) }
			>
				<p>{ translate( 'We came across a problem while trying to restore your site.' ) }</p>
				<Button primary onClick={ this.handleClickRestore }>
					{ translate( 'Try again' ) }
				</Button>
				{ '  ' }
				<Button>
					{ translate( 'Get help' ) }
				</Button>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
} )( localize( ErrorBanner ) );
