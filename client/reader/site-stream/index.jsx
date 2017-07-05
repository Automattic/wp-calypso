/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import RefreshFeedHeader from 'blocks/reader-feed-header';
import EmptyContent from './empty';
import Stream from 'reader/stream';
import FeedError from 'reader/feed-error';
import FeedFeatured from './featured';
import needs, { readerSite, readerFeed } from 'lib/needs';

class SiteStream extends React.Component {
	static propTypes = {
		siteId: React.PropTypes.number.isRequired,
		className: React.PropTypes.string,
		showBack: React.PropTypes.bool,
		isDiscoverStream: React.PropTypes.bool,
		featuredStore: React.PropTypes.object,
	};

	static defaultProps = {
		showBack: true,
		className: 'is-site-stream',
		isDiscoverStream: false,
	};

	goBack = () => {
		if ( typeof window !== 'undefined' ) {
			window.history.back();
		}
	};

	render() {
		const { site, feed, featuredStore } = this.props;
		// check for redirect
		if ( site && site.prefer_feed && site.feed_ID ) {
			page.replace( '/read/feeds/' + site.feed_ID );
		}

		const emptyContent = <EmptyContent />;
		const title = site ? site.name : this.props.translate( 'Loading Site' );

		if ( ( site && site.is_error ) || ( feed && feed.is_error ) ) {
			return <FeedError sidebarTitle={ title } />;
		}

		const featuredContent = featuredStore && <FeedFeatured store={ featuredStore } />;

		return (
			<Stream
				{ ...this.props }
				listName={ title }
				emptyContent={ emptyContent }
				showPostHeader={ false }
				showSiteNameOnCards={ false }
				isDiscoverStream={ this.props.isDiscoverStream }
				shouldCombineCards={ false }
			>
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: title } ) } />
				<RefreshFeedHeader site={ site } feed={ feed } showBack={ this.props.showBack } />
				{ featuredContent }
			</Stream>
		);
	}
}

export default needs( [
	readerSite( { site: 'siteId' } ),
	readerFeed( { feed: 'feedId' } ),
] )(
	localize( SiteStream )
);
