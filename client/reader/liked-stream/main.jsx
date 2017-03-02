import React from 'react';

import Stream from 'reader/stream';
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';

var LikedStream = React.createClass( {

	render: function() {
		var title = this.translate( 'My Likes' ),
			emptyContent = ( <EmptyContent /> );

		return (
			<Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showFollowInHeader={ true }>
				<DocumentHead title={ this.translate( '%s ‹ Reader', { args: title } ) } />
			</Stream>
		);
	}

} );

export default LikedStream;
