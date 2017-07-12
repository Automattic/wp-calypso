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
import TrackComponentView from 'lib/analytics/track-component-view';
import { getSiteUrl } from 'state/selectors';
import { dismissRewindRestoreProgress as dismissRewindRestoreProgressAction } from 'state/activity-log/actions';

class SuccessBanner extends PureComponent {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		siteUrl: PropTypes.string.isRequired,
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
			siteUrl,
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
				<TrackComponentView eventName="calypso_activity_log_success_banner_impression" eventProperties={ {
					restoreTo: timestamp,
				} } />
				<p>{ translate(
					'We successfully restored your site back to %s!',
					{ args: moment( timestamp ).format( 'LLLL' ) }
				) }</p>
				<Button
					href={ siteUrl }
					primary
				>
					{ translate( 'View site' ) }
				</Button>
				{ '  ' }
				<Button onClick={ this.handleDismiss }>
					{ translate( 'Thanks, got it!' ) }
				</Button>
			</ActivityLogBanner>
		);
	}
}

export default connect(
	( state, { siteId } ) => ( {
		siteUrl: getSiteUrl( state, siteId ),
	} ),
	{
		dismissRewindRestoreProgress: dismissRewindRestoreProgressAction,
	}
)( localize( SuccessBanner ) );
