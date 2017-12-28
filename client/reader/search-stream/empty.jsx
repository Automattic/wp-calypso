/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'client/components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'client/reader/stats';
import { isDiscoverEnabled } from 'client/reader/discover/helper';

class SearchEmptyContent extends React.Component {
	static propTypes = {
		query: PropTypes.string,
	};

	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		recordTrack( 'calypso_reader_following_on_empty_search_stream_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_empty_search_stream_clicked' );
	};

	render() {
		const action = (
			<a className="empty-content__action button is-primary" onClick={ this.recordAction } href="/">
				{ this.props.translate( 'Back to Following' ) }
			</a>
		);

		const secondaryAction = isDiscoverEnabled() ? (
			<a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover"
			>
				{ this.props.translate( 'Explore Discover' ) }
			</a>
		) : null;

		const message = this.props.translate( 'No posts found for {{query /}} for your language.', {
			components: {
				query: <em>{ this.props.query }</em>,
			},
		} );

		return (
			<EmptyContent
				title={ this.props.translate( 'No Results' ) }
				line={ message }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 400 }
			/>
		);
	}
}

export default localize( SearchEmptyContent );
