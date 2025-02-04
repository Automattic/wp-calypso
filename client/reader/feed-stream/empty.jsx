import { localize } from 'i18n-calypso';
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class FeedEmptyContent extends PureComponent {
	recordAction = () => {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_search_on_empty_feed_clicked' );
	};

	render() {
		const { translate } = this.props;
		const action = (
			<a
				className="empty-content__action button is-primary" // eslint-disable-line
				onClick={ this.recordAction }
				href="/reader/search"
			>
				{ translate( 'Find sites to follow' ) }
			</a>
		);

		return (
			<EmptyContent
				title={ translate( 'No recent posts' ) }
				line={ translate( 'This site has not posted anything recently.' ) }
				action={ action }
				illustration=""
			/>
		);
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( FeedEmptyContent ) );
