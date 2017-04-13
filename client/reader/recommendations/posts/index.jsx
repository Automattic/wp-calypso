/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';

var RecommendationPostsStream = React.createClass( {

	render: function() {
		var title = this.translate( 'Recommended Posts' ),
			emptyContent = ( <EmptyContent /> );

		return (
			<Stream { ...this.props }
				listName = { title }
				emptyContent = { emptyContent }
				showFollowInHeader = { true }
			>
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: title } ) } />
			</Stream>
		);
	}

} );

export default RecommendationPostsStream;
