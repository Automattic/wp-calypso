/** @format */
/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import DocumentHead from 'components/data/document-head';
import ReaderFeedHeader from 'blocks/reader-feed-header';
import EmptyContent from './empty';
import Stream from 'reader/stream';
import FeedError from 'reader/feed-error';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import isSiteBlocked from 'state/selectors/is-site-blocked';
import SiteBlocked from 'reader/site-blocked';

import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import FeedFeatured from './featured';

class SiteStream extends React.Component {
	static propTypes = {
		siteId: PropTypes.number.isRequired,
		className: PropTypes.string,
		showBack: PropTypes.bool,
		isDiscoverStream: PropTypes.bool,
		featuredStreamKey: PropTypes.string,
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
		const { site, feed, featuredStreamKey, isBlocked, siteId } = this.props;
		// check for redirect
		if ( site && site.prefer_feed && site.feed_ID ) {
			page.replace( '/read/feeds/' + site.feed_ID );
		}

		const emptyContent = <EmptyContent />;
		const title = site ? site.name : this.props.translate( 'Loading Site' );

		if ( isBlocked ) {
			return <SiteBlocked title={ title } siteId={ siteId } />;
		}

		if ( ( site && site.is_error ) || ( feed && feed.is_error ) ) {
			return <FeedError sidebarTitle={ title } />;
		}

		const featuredContent = featuredStreamKey && <FeedFeatured streamKey={ featuredStreamKey } />;

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
				<ReaderFeedHeader site={ site } feed={ feed } showBack={ this.props.showBack } />
				{ featuredContent }
				{ ! site && <QueryReaderSite siteId={ this.props.siteId } /> }
				{ ! feed && site && site.feed_ID && <QueryReaderFeed feedId={ site.feed_ID } /> }
			</Stream>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const site = getSite( state, ownProps.siteId );
	return {
		site: site,
		feed: site && site.feed_ID && getFeed( state, site.feed_ID ),
		isBlocked: isSiteBlocked( state, ownProps.siteId ),
	};
} )( localize( SiteStream ) );
