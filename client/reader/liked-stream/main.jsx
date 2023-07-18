import { translate } from 'i18n-calypso';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import Stream from 'calypso/reader/stream';
import EmptyContent from './empty';

const title = translate( 'My Likes' );
const documentTitle = translate( '%s ‹ Reader', {
	args: title,
	comment: '%s is the section name. For example: "My Likes"',
} );

const emptyContent = () => <EmptyContent />;

class LikedStream extends Component {
	render() {
		return (
			<Stream
				{ ...this.props }
				listName={ title }
				emptyContent={ emptyContent }
				showFollowInHeader={ true }
			>
				<DocumentHead title={ documentTitle } />
			</Stream>
		);
	}
}

export default LikedStream;
