/**
 * External dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { localize } from 'i18n-calypso';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from './empty';
import DocumentHead from 'calypso/components/data/document-head';
import Stream from 'calypso/reader/stream';
import FeedError from 'calypso/reader/feed-error';
import ReaderFeedHeader from 'calypso/blocks/reader-feed-header';
import QueryReaderSite from 'calypso/components/data/query-reader-site';
import QueryReaderFeed from 'calypso/components/data/query-reader-feed';
import { getSite } from 'calypso/state/reader/sites/selectors';
import { getFeed } from 'calypso/state/reader/feeds/selectors';
import { getSiteName } from 'calypso/reader/get-helpers';
import { isSiteBlocked } from 'calypso/state/reader/site-blocks/selectors';
import SiteBlocked from 'calypso/reader/site-blocked';

// If the blog_ID of a reader feed is 0, that means no site exists for it.
const getReaderSiteId = ( feed ) => ( feed && feed.blog_ID === 0 ? null : feed && feed.blog_ID );

class FeedStream extends React.Component {
	static propTypes = {
		feedId: PropTypes.number.isRequired,
		className: PropTypes.string,
		showBack: PropTypes.bool,
	};

	static defaultProps = {
		showBack: true,
		className: 'is-site-stream',
	};
	constructor( props ) {
		super( props );
		this.title = props.translate( 'Loading Feed' );
	}
	render() {
		const { feed, site, siteId, isBlocked } = this.props;

		const emptyContent = <EmptyContent />;
		const title = getSiteName( { feed, site } ) || this.title;

		if ( isBlocked ) {
			return <SiteBlocked title={ title } siteId={ siteId } />;
		}

		if ( ( feed && feed.is_error ) || ( site && site.is_error ) ) {
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
				<DocumentHead
					title={ this.props.translate( '%s ‹ Reader', {
						args: title,
						comment: '%s is the section name. For example: "My Likes"',
					} ) }
				/>
				<ReaderFeedHeader
					feed={ feed }
					site={ site }
					showBack={ this.props.showBack }
					streamKey={ this.props.streamKey }
				/>
				{ ! feed && <QueryReaderFeed feedId={ this.props.feedId } /> }
				{ siteId && <QueryReaderSite siteId={ siteId } /> }
			</Stream>
		);
	}
}

export default connect( ( state, ownProps ) => {
	const feed = getFeed( state, ownProps.feedId );
	const siteId = getReaderSiteId( feed );

	return {
		feed,
		siteId,
		site: siteId && getSite( state, siteId ),
		isBlocked: isSiteBlocked( state, siteId ),
	};
} )( localize( FeedStream ) );
