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

class SuccessBanner extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		timestamp: PropTypes.number.isRequired,

		// connect
		dismissRewindRestoreProgress: PropTypes.func.isRequired,

		// localize
		moment: PropTypes.func.isRequired,
		translate: PropTypes.func.isRequired,
	};

	handleDismiss = () => this.props.dismissRewindRestoreProgress( this.props.siteId );

	render() {
		const {
			moment,
			timestamp,
			translate,
		} = this.props;

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="success"
				title={ translate( 'Your site has been successfully restored' ) }
			>
				<p>{ translate(
					'We successfully restored your site back to %s!',
					{ args: moment( timestamp ).format( 'LLLL' ) }
				) }</p>
				<Button primary>
					{ /* FIXME: Link to site */ translate( 'View site' ) }
				</Button>
				{ '  ' }
				<Button onClick={ this.handleDismiss }>
					{ translate( 'Thanks, got it!' ) }
				</Button>
			</ActivityLogBanner>
		);
	}
}

export default connect( null, {
	dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
} )( localize( SuccessBanner ) );
