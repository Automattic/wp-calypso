import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { getSelectedFeedId } from 'calypso/state/reader-ui/sidebar/selectors';
import { withReaderPerformanceTrackerStop } from '../reader-performance-tracker';

class FollowingEmptyContent extends Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = ( isFullSiteFeed = false ) => {
		if ( isFullSiteFeed ) {
			recordAction( 'clicked_visit_full_site_feed_on_empty' );
			recordGaEvent( 'Clicked Visit Full Site Feed on EmptyContent' );
			this.props.recordReaderTracksEvent(
				'calypso_reader_visit_full_site_feed_on_empty_stream_clicked'
			);
		} else {
			recordAction( 'clicked_discover_on_empty' );
			recordGaEvent( 'Clicked Discover on EmptyContent' );
			this.props.recordReaderTracksEvent( 'calypso_reader_discover_on_empty_stream_clicked' );
		}
	};

	render() {
		const { selectedFeedId, translate } = this.props;
		const isFullSiteFeed = !! selectedFeedId;

		return (
			<EmptyContent
				className="stream__empty"
				title={ translate( "You're all caught up." ) }
				line={ translate( 'No new posts in the last 60 days.' ) }
				action={
					isFullSiteFeed
						? translate( 'Visit the Full Site Feed' )
						: translate( 'Discover New Sites' )
				}
				actionURL={ isFullSiteFeed ? `/read/feeds/${ selectedFeedId }` : '/discover' }
				actionCallback={ () => this.recordAction( isFullSiteFeed ) }
				illustration=""
			/>
		);
	}
}

export default connect(
	( state ) => ( {
		selectedFeedId: getSelectedFeedId( state ),
	} ),
	{
		recordReaderTracksEvent,
	}
)( withReaderPerformanceTrackerStop( localize( FollowingEmptyContent ) ) );
