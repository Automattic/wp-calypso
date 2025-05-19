import { localize } from 'i18n-calypso';
import { Component } from 'react';
import { connect } from 'react-redux';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class ListMissing extends Component {
	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_following_on_missing_list_clicked' );
	};

	render() {
		return (
			<ReaderMain>
				<DocumentHead title={ this.props.translate( 'List not found' ) } />
				<EmptyContent
					title={ this.props.translate( 'List not found' ) }
					line={ this.props.translate( "Sorry, we couldn't find that list." ) }
					action={ this.props.translate( 'Back to Followed Sites' ) }
					actionURL="/reader"
					actionCallback={ this.recordAction }
				/>
			</ReaderMain>
		);
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( ListMissing ) );
