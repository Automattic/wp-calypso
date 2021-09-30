import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import charactersImage from 'calypso/assets/images/reader/reader-conversations-characters.svg';
import EmptyContent from 'calypso/components/empty-content';
import { withPerformanceTrackerStop } from 'calypso/lib/performance-tracking';
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
				href="/read/search"
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
						'To get started, like or comment on some posts.'
				) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ charactersImage }
				illustrationWidth={ 400 }
			/>
		);
	}
	/* eslint-enable wpcalypso/jsx-classname-namespace */
}

export default connect( null, { recordReaderTracksEvent } )(
	withPerformanceTrackerStop( localize( ConversationsEmptyContent ) )
);
