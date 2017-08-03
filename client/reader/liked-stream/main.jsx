/** @format */
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

class LikedStream extends React.Component {
	render() {
		var title = this.props.translate( 'My Likes' ),
			emptyContent = <EmptyContent />;

		return (
			<Stream
				{ ...this.props }
				listName={ title }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
			>
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: title } ) } />
			</Stream>
		);
	}
}

export default localize( LikedStream );
