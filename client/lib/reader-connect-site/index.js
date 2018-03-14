/** @format */

/**
 * External dependencies
 */

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

/*
 * Internal Dependencies
 */
import { getSite, getSiteByFeedUrl } from 'state/reader/sites/selectors';
import { getFeed, getFeedByFeedUrl } from 'state/reader/feeds/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { getReaderAliasedFollowFeedUrl } from 'state/selectors';

/**
 * A HoC function that will take in reader identifiers siteId or feedId and
 * pass down all of the fetched data objects they represent
 *
 *  It supports two
 *  1. feedId --> feedId, siteId, feed, site
 *  2. blogId --> feedId, siteId, feed, site
 *
 * @param {object} Component the component to wrap
 * @returns {object} wrapped component that hands down feed/site to its child
 */
const connectSite = Component => {
	class connectSiteFetcher extends React.PureComponent {
		static propTypes = {
			feed: PropTypes.object,
			site: PropTypes.object,
			url: PropTypes.string,
		};

		render() {
			return (
				<div>
					{ !! this.props.feedId && <QueryReaderFeed feedId={ this.props.feedId } /> }
					{ !! this.props.siteId && <QueryReaderSite siteId={ this.props.siteId } /> }
					<Component { ...this.props } />
				</div>
			);
		}
	}

	return connect( ( state, ownProps ) => {
		let { feedId, siteId } = ownProps;
		let feed = !! feedId ? getFeed( state, feedId ) : undefined;
		let site = !! siteId ? getSite( state, siteId ) : undefined;

		if ( feed && ! siteId ) {
			siteId = feed.blog_ID !== 0 ? feed.blog_ID : undefined;
			site = !! siteId ? getSite( state, feed.blog_ID ) : undefined;
		}
		if ( site && ! feedId ) {
			feedId = site.feed_ID;
			feed = !! feedId ? getFeed( state, site.feed_ID ) : undefined;
		}

		// as a last effort check if we have the site/feed by url
		if ( ! feed && ownProps.url ) {
			feed = getFeedByFeedUrl( state, getReaderAliasedFollowFeedUrl( state, ownProps.url ) );
		}
		if ( ! site && ownProps.url ) {
			site = getSiteByFeedUrl( state, getReaderAliasedFollowFeedUrl( state, ownProps.url ) );
		}

		return { feed, site, siteId, feedId };
	} )( connectSiteFetcher );
};

export default connectSite;
