import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import welcomeImage from 'calypso/assets/images/reader/reader-welcome-illustration.svg';
import EmptyContent from 'calypso/components/empty-content';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class UnseenEmptyContent extends Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_search_on_empty_unread' );
		recordGaEvent( 'Clicked Search on UnreadEmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_search_on_unread_empty_stream_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */

		return (
			<EmptyContent
				className="stream__empty"
				title={ this.props.translate( 'You have no unread posts!' ) }
				line={ this.props.translate( "Good job! You're all caught up." ) }
				action={ null }
				secondaryAction={ null }
				illustration={ welcomeImage }
				illustrationWidth={ 350 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withPerformanceTrackerStop( localize( UnseenEmptyContent ) ) );
