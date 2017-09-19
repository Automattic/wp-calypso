/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import EmptyContent from './empty';
import RefreshFeedHeader from 'blocks/reader-feed-header';
import DocumentHead from 'components/data/document-head';
import QueryReaderFeed from 'components/data/query-reader-feed';
import QueryReaderSite from 'components/data/query-reader-site';
import FeedError from 'reader/feed-error';
import { getSiteName } from 'reader/get-helpers';
import Stream from 'reader/stream';
import { getFeed } from 'state/reader/feeds/selectors';
import { getSite } from 'state/reader/sites/selectors';

// If the blog_ID of a reader feed is 0, that means no site exists for it.
const getReaderSiteId = feed => ( feed && feed.blog_ID === 0 ? null : feed && feed.blog_ID );

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

	render() {
		const { feed, site, siteId } = this.props;
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
	};
} )( localize( FeedStream ) );
