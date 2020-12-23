/**
 * External dependencies
 */
import React from 'react';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Stream from 'calypso/reader/stream';
import EmptyContent from './empty';
import DocumentHead from 'calypso/components/data/document-head';

const title = translate( 'My Likes' );
const documentTitle = translate( '%s ‹ Reader', {
	args: title,
	comment: '%s is the section name. For example: "My Likes"',
} );

class LikedStream extends React.Component {
	render() {
		const emptyContent = <EmptyContent />;
		return (
			<Stream { ...this.props } listName={ title } emptyContent={ emptyContent } showFollowInHeader>
				<DocumentHead title={ documentTitle } />
			</Stream>
		);
	}
}

export default LikedStream;
