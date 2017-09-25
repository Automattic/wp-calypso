/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ActivityLogBanner from './index';
import Button from 'components/button';
import TrackComponentView from 'lib/analytics/track-component-view';
import { dismissRewindRestoreProgress as dismissRewindRestoreProgressAction } from 'state/activity-log/actions';
import { getSiteUrl } from 'state/selectors';

class SuccessBanner extends PureComponent {
	static propTypes = {
		applySiteOffset: PropTypes.func.isRequired,
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
		const { applySiteOffset, moment, siteUrl, timestamp, translate } = this.props;

		return (
			<ActivityLogBanner
				isDismissable
				onDismissClick={ this.handleDismiss }
				status="success"
				title={ translate( 'Your site has been successfully restored' ) }
			>
				<TrackComponentView
					eventName="calypso_activitylog_successbanner_impression"
					eventProperties={ {
						restore_to: timestamp,
					} }
				/>
				<p>
					{ translate( 'We successfully restored your site back to %s!', {
						args: applySiteOffset( moment.utc( timestamp ) ).format( 'LLLL' ),
					} ) }
				</p>
				<Button href={ siteUrl } primary>
					{ translate( 'View site' ) }
				</Button>
				{ '  ' }
				<Button onClick={ this.handleDismiss }>{ translate( 'Thanks, got it!' ) }</Button>
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
