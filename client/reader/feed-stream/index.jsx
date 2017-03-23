/**
 * External dependencies
 */
import React from 'react';
import url from 'url';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from './empty';
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import FeedError from 'reader/feed-error';
import RefreshFeedHeader from 'blocks/reader-feed-header';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';

class FeedStream extends React.Component {

	static propTypes = {
		feedId: React.PropTypes.number.isRequired,
		className: React.PropTypes.string,
		showBack: React.PropTypes.bool
	};

	static defaultProps = {
		showBack: true,
		className: 'is-site-stream',
	};

	getTitle = ( feed, site ) => {
		let title;

		if ( ! feed && ! site ) {
			return this.props.translate( 'Loading Feed' );
		}

		if ( feed.is_error ) {
			title = this.props.translate( 'Error fetching feed' );
		} else if ( feed ) {
			title = feed.name;
		}

		if ( ! title && site ) {
			title = site.get( 'name' );
		}

		if ( ! title && feed ) {
			title = feed.URL || feed.feed_URL;
			if ( title ) {
				title = url.parse( title ).hostname;
			}
		}

		if ( ! title && site ) {
			title = site.get( 'URL' );
			if ( title ) {
				title = url.parse( title ).hostname;
			}
		}

		if ( ! title ) {
			title = this.props.translate( 'Loading Feed' );
		}

		return title;
	}

	render() {
		const { feed, site } = this.props;
		const emptyContent = ( <EmptyContent /> );
		const title = this.getTitle( feed, site );

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
				<DocumentHead title={ this.props.translate( '%s ‹ Reader', { args: title } ) } />
				<RefreshFeedHeader feed={ feed } site={ site } showBack={ this.props.showBack } />
				{ ! feed && <QueryReaderFeed feedId={ this.props.feedId } /> }
				{ ! site && feed.blog_ID && <QueryReaderSite siteId={ feed.blog_ID } /> }
			</Stream>
		);
	}
}

export default connect(
	( state, ownProps ) => {
		const feed = getFeed( state, ownProps.feedId );
		return {
			feed,
			site: feed && feed.blog_ID && getSite( state, feed.blog_ID ),
		};
	}
)( localize( FeedStream ) );

