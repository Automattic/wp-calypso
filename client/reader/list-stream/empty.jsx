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

var ListEmptyContent = React.createClass( {
	shouldComponentUpdate: function() {
		return false;
	},

	recordAction: function() {
		recordAction( 'clicked_following_on_empty' );
		recordGaEvent( 'Clicked Following on EmptyContent' );
		recordTrack( 'calypso_reader_following_on_empty_list_stream_clicked' );
	},

	recordSecondaryAction: function() {
		recordAction( 'clicked_discover_on_empty' );
		recordGaEvent( 'Clicked Discover on EmptyContent' );
		recordTrack( 'calypso_reader_discover_on_empty_list_stream_clicked' );
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
			title={ this.translate( 'No recent posts' ) }
			line={ this.translate( 'The sites in this list have not posted anything recently.' ) }
			action={ action }
			secondaryAction={ secondaryAction }
			illustration={ '/calypso/images/drake/drake-empty-results.svg' }
			illustrationWidth={ 500 }
			/> );
	}
} );

export default ListEmptyContent;
