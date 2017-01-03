/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import ReaderPostCard from 'blocks/reader-post-card';
import { getSite } from 'state/reader/sites/selectors';
import { getFeed } from 'state/reader/feeds/selectors';
import QueryReaderSite from 'components/data/query-reader-site';
import QueryReaderFeed from 'components/data/query-reader-feed';
import FeedPostStore from 'lib/feed-post-store';
import smartSetState from 'lib/react-smart-set-state';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';
import {
	isDiscoverPost,
	isDiscoverSitePick,
	getSourceData as getDiscoverSourceData,
	discoverBlogId
 } from 'reader/discover/helper';

class ReaderPostCardAdapter extends React.Component {

	onClick = ( postToOpen ) => {
		let referredPost;
		if ( this.props.originalPost && isDiscoverPost( this.props.post ) && ! isDiscoverSitePick( this.props.post ) ) {
			referredPost = { ...postToOpen,
				referral: {
					blogId: discoverBlogId,
					postId: this.props.post.ID
				}
			};
		}
		this.props.handleClick && this.props.handleClick( {
			post: referredPost || postToOpen
		} );
	}

	onCommentClick = () => {
		recordAction( 'click_comments' );
		recordGaEvent( 'Clicked Post Comment Button' );
		recordTrackForPost( 'calypso_reader_post_comments_button_clicked', this.props.post );

		this.props.handleClick && this.props.handleClick( {
			post: this.props.post,
			comments: true
		} );
	}

	// take what the stream hands to a card and adapt it
	// for use by a ReaderPostCard
	render() {
		const {
			feed_ID: feedId,
			site_ID: siteId,
			is_external: isExternal
		} = this.props.post;
		const _isDiscoverPost = isDiscoverPost( this.props.post );

		// only query the site if the feed id is missing. feed queries end up fetching site info
		// via a meta query, so we don't need both.
		return (
			<ReaderPostCard
				post={ this.props.post }
				originalPost={ this.props.originalPost }
				site={ this.props.site }
				feed={ this.props.feed }
				onClick={ this.onClick }
				onCommentClick={ this.onCommentClick }
				isSelected={ this.props.isSelected }
				showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards }
				showEntireExcerpt={ _isDiscoverPost }
				useBetterExcerpt={ ! _isDiscoverPost }
				followSource={ this.props.followSource }
				showSiteName={ this.props.showSiteName }>
				{ feedId && <QueryReaderFeed feedId={ feedId } includeMeta={ false } /> }
				{ ! isExternal && siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
			</ReaderPostCard>
		);
	}
}

const ConnectedReaderPostCardAdapter = connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, 'post.site_ID' );
		const isExternal = get( ownProps, 'post.is_external' );
		const feedId = get( ownProps, 'post.feed_ID' );
		return {
			site: isExternal ? null : getSite( state, siteId ),
			feed: getFeed( state, feedId ),
			originalPost: ownProps.originalPost
		};
	}
)( ReaderPostCardAdapter );

/**
 * A container for the ReaderPostCardAdapter responsible for binding to Flux stores
 */
export default class ReaderPostCardAdapterFluxContainer extends React.Component {
	constructor( props ) {
		super( props );
		this.state = this.getStateFromStores( props );
		this.smartSetState = smartSetState;
	}

	getStateFromStores( props = this.props ) {
		const post = props.post;
		const nonSiteDiscoverPick = isDiscoverPost( post ) && ! isDiscoverSitePick( post );

		// If it's a discover post (but not a site pick), we want the original post too
		const originalPost = nonSiteDiscoverPick ? FeedPostStore.get( getDiscoverSourceData( post ) ) : null;

		return {
			originalPost
		};
	}

	updateState = ( newState = this.getStateFromStores() ) => {
		this.smartSetState( newState );
	}

	componentWillMount() {
		FeedPostStore.on( 'change', this.updateState );
	}

	componentWillReceiveProps( nextProps ) {
		this.updateState( this.getStateFromStores( nextProps ) );
	}

	componentWillUnmount() {
		FeedPostStore.off( 'change', this.updateState );
	}

	render() {
		return ( <ConnectedReaderPostCardAdapter
					{ ...this.props }
					originalPost={ this.state.originalPost } /> );
	}
}
