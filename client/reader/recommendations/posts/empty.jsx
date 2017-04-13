/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import {
	recordAction,
	recordGaEvent,
	recordTrack,
} from 'reader/stats';
import { isDiscoverEnabled } from 'reader/discover/helper';

var RecommendedPostsEmptyContent = React.createClass( {
	shouldComponentUpdate: function() {
		return false;
	},

	recordAction: function() {
		recordAction( 'clicked_following_on_empty_recommended_posts' );
		recordGaEvent( 'Clicked Following on Empty Recommended Posts Stream' );
		recordTrack( 'calypso_reader_following_on_empty_Posts_stream_clicked' );
	},

	recordSecondaryAction: function() {
		recordAction( 'clicked_discover_on_empty_recommended_posts' );
		recordGaEvent( 'Clicked Discover on Empty Recommended Posts Stream' );
		recordTrack( 'calypso_reader_discover_on_empty_Posts_stream_clicked' );
	},

	render: function() {
		var action = ( <a
			className="empty-content__action button is-primary"
			onClick={ this.recordAction }
			href="/">{ this.translate( 'Back to Following' ) }</a> ),
			secondaryAction = isDiscoverEnabled()
			? ( <a
				className="empty-content__action button"
				onClick={ this.recordSecondaryAction }
				href="/discover">{ this.translate( 'Explore Discover' ) }</a> ) : null;

		return ( <EmptyContent
			title={ this.translate( 'No Post Recommendations yet' ) }
			line={ this.translate( 'Posts we recommend based on your WordPress.com activity will appear here.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

export default RecommendedPostsEmptyContent;
