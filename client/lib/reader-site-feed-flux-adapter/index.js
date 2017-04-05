/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';

/*
 * Internal Dependencies
 */
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';

/**
 * A HoC function that translates a siteId or a feedId into both a feed/site and hands that prop to its children
 */
const ReaderSiteFeedFluxAdapter = Component => {
	class SiteFeedFetcher extends React.Component {
		render() {
			return (
				<div>
					{ ! this.props.feed && !! this.props.feedId && <QueryReaderFeed feedId={ this.props.feedId } /> }
					{ ! this.props.site && !! this.props.siteId && <QueryReaderSite siteId={ this.props.siteId } /> }
					<Component { ...this.props } />
				</div>
			);
		}
	}
	return connect(
		( state, ownProps ) => {
			let { feedId, siteId } = ownProps;
			if ( feedId ) {
				const feed = getFeed( state, feedId );
				if ( ! siteId ) {
					siteId = feed && feed.blog_ID ? siteId : undefined;
				}
			} else {
				const site = getSite( state, siteId );
				if ( ! feedId ) {
					feedId = site && site.feed_ID ? site.feed_ID : undefined;
				}
			}

			const feed = getFeed( state, feedId );
			const site = ( feed && feed.is_external ) ? true : getSite( state, siteId ); // if its external then stop requesting for it with query component

			return {
				feed,
				site,
				siteId: +siteId,
				feedId: +feedId,
			};
		}
	)( SiteFeedFetcher );
};

export default ReaderSiteFeedFluxAdapter;

