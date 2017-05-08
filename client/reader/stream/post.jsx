/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { get, omit } from 'lodash';

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
	isDiscoverSitePick,
	getSourceData as getDiscoverSourceData,
	discoverBlogId
} from 'reader/discover/helper';
import { shallowEquals } from 'reader/utils';

class ReaderPostCardAdapter extends React.Component {
	static displayName = 'ReaderPostCardAdapter';

	onClick = ( postToOpen ) => {
		let referredPost;
		if ( get( this.props, 'discoverPick.post' ) ) {
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
			is_external: isExternal,
			is_discover: isDiscover,
		} = this.props.post;

		// if this is a discover pick query for the discover pick site
		let discoverPickSiteId;
		if ( isDiscover ) {
			const { blogId } = getDiscoverSourceData( this.props.post );
			discoverPickSiteId = blogId;
		}

		// only query the site if the feed id is missing. feed queries end up fetching site info
		// via a meta query, so we don't need both.
		return (
			<ReaderPostCard
				post={ this.props.post }
				discoverPick={ this.props.discoverPick }
				site={ this.props.site }
				feed={ this.props.feed }
				onClick={ this.onClick }
				onCommentClick={ this.onCommentClick }
				isSelected={ this.props.isSelected }
				showPrimaryFollowButton={ this.props.showPrimaryFollowButtonOnCards }
				followSource={ this.props.followSource }
				showSiteName={ this.props.showSiteName }
				isDiscoverStream={ this.props.isDiscoverStream }
				postKey={ this.props.postKey }
			>
				{ feedId && <QueryReaderFeed feedId={ feedId } includeMeta={ false } /> }
				{ ! isExternal && siteId && <QueryReaderSite siteId={ +siteId } includeMeta={ false } /> }
				{ discoverPickSiteId && <QueryReaderSite siteId={ discoverPickSiteId } includeMeta={ false } /> }
			</ReaderPostCard>
		);
	}
}

const ConnectedReaderPostCardAdapter = connect(
	( state, ownProps ) => {
		const siteId = get( ownProps, 'post.site_ID' );
		const isExternal = get( ownProps, 'post.is_external' );
		const feedId = get( ownProps, 'post.feed_ID' );

		// set up the discover pick
		let discoverPick = null;
		if ( get( ownProps, 'post.is_discover' ) ) {
			// copy discoverPick from feed store
			const discoverPickPost = get( ownProps, 'discoverPick.post' );

			// limit discover pick site to discover stream
			if ( ownProps.isDiscoverStream ) {
				// add discoverPick site from state
				const { blogId } = getDiscoverSourceData( ownProps.post );
				const discoverPickSite = blogId ? getSite( state, blogId ) : null;

				if ( discoverPickPost || discoverPickSite ) {
					discoverPick = {
						post: discoverPickPost,
						site: discoverPickSite,
					};
				}
			} else if ( discoverPickPost ) {
				discoverPick = {
					post: discoverPickPost
				};
			}
		}
		return {
			site: isExternal ? null : getSite( state, siteId ),
			feed: getFeed( state, feedId ),
			discoverPick,
		};
	}
)( ReaderPostCardAdapter );

/**
 * A container for the ReaderPostCardAdapter responsible for binding to Flux stores
 */
export default class ReaderPostCardAdapterFluxContainer extends React.Component {
	static displayName = 'ReaderPostCardAdapterFluxContainer';

	constructor( props ) {
		super( props );
		this.state = this.getStateFromStores( props );
		this.smartSetState = smartSetState;
	}

	getStateFromStores( props = this.props ) {
		const post = props.post;
		const nonSiteDiscoverPick = post.is_discover && ! isDiscoverSitePick( post );

		// If it's a discover post (but not a site pick), we want the original post too
		let discoverPick = null;
		if ( nonSiteDiscoverPick ) {
			discoverPick = {
				post: FeedPostStore.get( getDiscoverSourceData( post ) )
			};
		}

		return {
			discoverPick
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

	shouldComponentUpdate( nextProps, nextState ) {
		const currentPropsToCompare = omit( this.props, 'handleClick' );
		const nextPropsToCompare = omit( nextProps, 'handleClick' );
		const shouldUpdate = (
			( this.props !== nextProps && ! shallowEquals( currentPropsToCompare, nextPropsToCompare ) ) ||
			( get( this.state, 'discoverPick.post' ) !== get( nextState, 'discoverPick.post' )
		) );

		return shouldUpdate;
	}

	render() {
		return ( <ConnectedReaderPostCardAdapter
					{ ...this.props }
					discoverPick={ this.state.discoverPick } /> );
	}
}
