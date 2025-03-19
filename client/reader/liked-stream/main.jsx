import { translate, fixMe } from 'i18n-calypso';
import { Component } from 'react';
import DocumentHead from 'calypso/components/data/document-head';
import NavigationHeader from 'calypso/components/navigation-header';
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
			<>
				<Stream
					{ ...this.props }
					listName={ title }
					emptyContent={ emptyContent }
					showFollowInHeader
				>
					<DocumentHead title={ documentTitle } />
					<NavigationHeader
						title={ translate( 'Likes' ) }
						subtitle={ fixMe( {
							text: 'Revisit the posts and comments you liked.',
							newCopy: translate( 'Revisit the posts and comments you liked.' ),
							oldCopy: translate( 'Rediscover content that you liked.' ),
						} ) }
						className="liked-stream-header"
					/>
				</Stream>
			</>
		);
	}
}

export default LikedStream;
