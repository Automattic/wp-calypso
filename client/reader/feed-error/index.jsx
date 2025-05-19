import i18n, { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import ReaderMain from 'calypso/reader/components/reader-main';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';

class FeedError extends Component {
	static defaultProps = {
		message: i18n.translate( "Sorry, we can't find that site." ),
	};

	recordAction = () => {
		recordAction( 'clicked_search_on_404' );
		recordGaEvent( 'Clicked Search on 404' );
		this.props.recordReaderTracksEvent( 'calypso_reader_search_on_feed_error_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/reader/search"
			>
				{ this.props.translate( 'Find sites to follow' ) }
			</a>
		);

		return (
			<ReaderMain>
				<EmptyContent action={ action } title={ this.props.message } />
			</ReaderMain>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

FeedError.propTypes = {
	sidebarTitle: PropTypes.string,
};

export default connect( null, {
	recordReaderTracksEvent,
} )( localize( FeedError ) );
