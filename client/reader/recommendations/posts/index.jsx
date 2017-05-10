/**
 * External dependencies
 */
import React from 'react';

import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Stream from 'reader/stream';
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';

var RecommendationPostsStream = React.createClass( {

	render: function() {
		var title = this.props.translate( 'Recommended Posts' ),
			emptyContent = ( <EmptyContent /> );

		return (
			<Stream { ...this.props }
				listName = { title }
				emptyContent = { emptyContent }
				showFollowInHeader = { true }
			>
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: title } ) } />
			</Stream>
		);
	}

} );

export default localize( RecommendationPostsStream );
