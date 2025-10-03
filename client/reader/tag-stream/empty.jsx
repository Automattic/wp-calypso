import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import EmptyContent from 'calypso/components/empty-content';
import { recordAction, recordGaEvent } from 'calypso/reader/stats';
import { recordReaderTracksEvent } from 'calypso/state/reader/analytics/actions';
import { withReaderPerformanceTrackerStop } from '../reader-performance-tracker';

class TagEmptyContent extends Component {
	static propTypes = {
		decodedTagSlug: PropTypes.string,
	};

	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_following_on_empty_tag_stream_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		this.props.recordReaderTracksEvent( 'calypso_reader_discover_on_empty_tag_stream_clicked' );
	};

	render() {
		/* eslint-disable wpcalypso/jsx-classname-namespace */
		const action = (
			<a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/reader"
			>
				{ this.props.translate( 'Back to Following' ) }
			</a>
		);

		const secondaryAction = (
			<a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover"
			>
				{ this.props.translate( 'Discover' ) }
			</a>
		);

		const message = this.props.translate(
			'{{wrapper}}No posts have recently been tagged with {{tagName /}} for your language.{{/wrapper}}',
			{
				components: {
					wrapper: <div className="tag-stream__empty-content-message" />,
					tagName: <em>{ this.props.decodedTagSlug }</em>,
				},
			}
		);

		return (
			<EmptyContent
				className="tag-stream__empty-content"
				title={ this.props.translate( 'No recent posts' ) }
				line={ message }
				action={ action }
				secondaryAction={ secondaryAction }
			/>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace */
	}
}

export default connect( null, {
	recordReaderTracksEvent,
} )( withReaderPerformanceTrackerStop( localize( TagEmptyContent ) ) );
