/** @format */
/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { recordAction, recordGaEvent, recordTrack } from 'reader/stats';
import { isDiscoverEnabled } from 'reader/discover/helper';

class RecommendedPostsEmptyContent extends React.Component {
	shouldComponentUpdate() {
		return false;
	}

	recordAction = () => {
		recordAction( 'clicked_following_on_empty_recommended_posts' );
		recordGaEvent( 'Clicked Following on Empty Recommended Posts Stream' );
		recordTrack( 'calypso_reader_following_on_empty_Posts_stream_clicked' );
	};

	recordSecondaryAction = () => {
		recordAction( 'clicked_discover_on_empty_recommended_posts' );
		recordGaEvent( 'Clicked Discover on Empty Recommended Posts Stream' );
		recordTrack( 'calypso_reader_discover_on_empty_Posts_stream_clicked' );
	};

	render() {
		let action = (
				<a
					className="empty-content__action button is-primary"
					onClick={ this.recordAction }
					href="/"
				>
					{ this.props.translate( 'Back to Following' ) }
				</a>
			),
			secondaryAction = isDiscoverEnabled() ? (
				<a
					className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/discover"
				>
					{ this.props.translate( 'Explore Discover' ) }
				</a>
			) : null;

		return (
			<EmptyContent
				title={ this.props.translate( 'No Post Recommendations yet' ) }
				line={ this.props.translate(
					'Posts we recommend based on your WordPress.com activity will appear here.'
				) }
				action={ action }
				secondaryAction={ secondaryAction }
				illustration={ '/calypso/images/illustrations/illustration-empty-results.svg' }
				illustrationWidth={ 500 }
			/>
		);
	}
}

export default localize( RecommendedPostsEmptyContent );
