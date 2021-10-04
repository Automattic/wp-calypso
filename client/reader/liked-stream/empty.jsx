import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class TagEmptyContent extends Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty_likes' );
		recordGaEvent( 'Clicked Following on Empty Like Stream' );
		this.props.recordReaderTracksEvent( 'calypso_reader_following_on_empty_like_stream_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/read"
			>
				{ this.props.translate( 'Back to Following' ) }
			</a>
		);

		return (
			<EmptyContent
				title={ this.props.translate( 'No likes yet' ) }
				line={ this.props.translate( 'Posts that you like will appear here.' ) }
				action={ action }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 400 }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withPerformanceTrackerStop( localize( TagEmptyContent ) ) );
