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
import DocumentHead from 'components/data/document-head';
import Stream from 'reader/stream';
import FeedError from 'reader/feed-error';
import ReaderFeedHeader from 'blocks/reader-feed-header';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import { getSiteName } from 'reader/get-helpers';
import { isSiteBlocked } from 'state/reader/site-blocks/selectors';
import SiteBlocked from 'reader/site-blocked';

// If the blog_ID of a reader feed is 0, that means no site exists for it.
const getReaderSiteId = ( feed ) => ( feed && feed.blog_ID === 0 ? null : feed && feed.blog_ID) ;

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
				<ReaderFeedHeader feed={ feed } site={ site } showBack={ this.props.showBack } />
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
