/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import FeedError from 'reader/feed-error';
import RefreshFeedHeader from 'blocks/reader-feed-header';
import { getSiteName } from 'reader/get-helpers';
import needs, { readerSite, readerFeed } from 'lib/needs';

class FeedStream extends React.Component {
	static propTypes = {
		feedId: React.PropTypes.number.isRequired,
		className: React.PropTypes.string,
		showBack: React.PropTypes.bool,
	};

	static defaultProps = {
		showBack: true,
		className: 'is-site-stream',
	};

	render() {
		const { feed, site } = this.props;
		const emptyContent = <EmptyContent />;
		const title = getSiteName( { feed, site } ) || this.props.translate( 'Loading Feed' );

		if ( feed && feed.is_error ) {
			return <FeedError sidebarTitle={ title } />;
		}

		return (
			<Stream
				{ ...this.props }
				listName={ title }
				emptyContent={ emptyContent }
				showPostHeader={ false }
				showSiteNameOnCards={ false }
				shouldCombineCards={ false }
			>
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: title } ) } />
				<RefreshFeedHeader feed={ feed } site={ site } showBack={ this.props.showBack } />
			</Stream>
		);
	}
}

export default needs( [
	readerSite( { site: 'siteId' } ),
	readerFeed( { feed: 'feedId' } ),
] )( localize( FeedStream ) );
