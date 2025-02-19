import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { withReaderPerformanceTrackerStop } from 'calypso/reader/reader-performance-tracker';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class ConversationsEmptyContent extends Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_search_on_empty_stream_clicked' );
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace */
	render() {
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/reader/search"
			>
				{ this.props.translate( 'Find posts to follow' ) }
			</a>
		);
		const secondaryAction = null;

		return (
			<EmptyContent
				className="conversations__empty-content"
				title={ this.props.translate( 'Welcome to Conversations' ) }
				line={ this.props.translate(
					"When WordPress posts spark lively conversations, they'll appear here. " +
						'To get started, follow or comment on some posts.'
				) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration=""
			/>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default connect( null, { recordReaderTracksEvent } )(
	withReaderPerformanceTrackerStop( localize( ConversationsEmptyContent ) )
);
