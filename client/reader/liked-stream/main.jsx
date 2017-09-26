/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';

class LikedStream extends React.Component {
	render() {
		let title = this.props.translate( 'My Likes' ),
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
