import React from 'react';

import EmptyContent from 'components/empty-content';
import {
	recordAction,
	recordGaEvent,
	recordTrack,
} from 'reader/stats';

const FeedEmptyContent = React.createClass( {
	shouldComponentUpdate: function() {
		return false;
	},

	recordAction: function() {
		recordAction( 'clicked_search_on_empty' );
		recordGaEvent( 'Clicked Search on EmptyContent' );
		recordTrack( 'calypso_reader_search_on_empty_feed_clicked' );
	},

	recordSecondaryAction: function() {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_empty_feed_clicked' );
	},

	render: function() {
		const action = <a
				className="empty-content__action button is-primary"
				onClick={ this.recordAction }
				href="/read/search">{ this.translate( 'Find Sites to Follow' ) }</a>,
			secondaryAction = (
				<a
					className="empty-content__action button"
					onClick={ this.recordSecondaryAction }
					href="/discover">{ this.translate( 'Explore Discover' ) }</a> );

		return ( <EmptyContent
			title={ this.translate( 'No recent posts' ) }
			line={ this.translate( 'This site has not posted anything recently.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

export default FeedEmptyContent;
