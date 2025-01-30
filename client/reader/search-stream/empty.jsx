import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { withReaderPerformanceTrackerStop } from '../reader-performance-tracker';

class SearchEmptyContent extends Component {
	static propTypes = {
		query: PropTypes.string,
	};

	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_following_on_empty_search_stream_clicked' );
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

		const message = this.props.translate( 'No posts found for {{query /}} for your language.', {
			components: {
				query: <em>{ this.props.query }</em>,
			},
		} );

		return (
			<EmptyContent
				title={ this.props.translate( 'No results' ) }
				line={ <p> { message } </p> }
				action={ action }
				illustration=""
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withReaderPerformanceTrackerStop( localize( SearchEmptyContent ) ) );
