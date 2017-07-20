/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	debug = require( 'debug' )( 'calypso:my-sites:posts' );

import { connect } from 'react-redux';
import { debounce, isEqual, isNumber, omit } from 'lodash';

/**
 * Internal dependencies
 */
var Post = require( './post' ),
	PostPlaceholder = require( './post-placeholder' ),
	EmptyContent = require( 'components/empty-content' ),
	InfiniteList = require( 'components/infinite-list' ),
	NoResults = require( 'my-sites/no-results' ),
	route = require( 'lib/route' ),
	mapStatus = route.mapPostStatus;

import QueryPosts from 'components/data/query-posts';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { hasInitializedSites } from 'state/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQueryIgnoringPage,
	getSitePostsLastPageForQuery,
} from 'state/posts/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import scrollTo from 'lib/scroll-to';

var GUESSED_POST_HEIGHT = 250;

var PostList = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		context: React.PropTypes.object,
		search: React.PropTypes.string,
		hasSites: React.PropTypes.bool,
		statusSlug: React.PropTypes.string,
		siteId: React.PropTypes.number,
		author: React.PropTypes.number
	},

	getInitialState: function() {
		// @FIXME(mcsf): don't commit
		window.resetPage = this.resetPage;

		return {
			page: 1,
		};
	},

	componentWillReceiveProps: function( nextProps ) {
		// @TODO(mcsf): fine-tune props to monitor
		const shouldReset = [ 'siteId', 'author' ].some( ( key ) =>
			this.props[ key ] !== nextProps[ key ] );

		if ( shouldReset ) {
			this.resetPage();
		}
	},

	incrementPage: function() {
		debug( 'incrementPage from', this.state.page );
		this.setState( { page: this.state.page + 1 } );
	},

	resetPage: function() {
		debug( 'resetPage' );
		this.setState( { page: 1 } );
		scrollTo( {
			y: 0,
		} );
	},

	render: function() {
		const {
			author,
			category,
			search,
			siteId,
			statusSlug,
			tag,
		} = this.props;

		const { page } = this.state;

		const query = {
			status: mapStatus( statusSlug ),
			order_by: 'date',
			order: 'DESC',
			type: 'post',
			site_visibility: 'visible',
			author,
			withImages: true,
			withCounts: true,
			//search,
			category,
			tag,
			page: page > 1 ? page : undefined,
		};

		return (
			<div>
				<QueryPosts
					siteId={ siteId }
					query={ query } />
				<Posts
					siteId={ siteId }
					query={ query }
					page={ page }
					incrementPage={ this.incrementPage }
					{ ...omit( this.props, 'children' ) }
				/>
			</div>
		);
		//
		//return (
		//	<PostListFetcher
		//		siteId={ this.props.siteId }
		//		status={ mapStatus( this.props.statusSlug ) }
		//		author={ this.props.author }
		//		withImages={ true }
		//		withCounts={ true }
		//		search={ this.props.search }>
		//		<Posts
		//			{ ...omit( this.props, 'children' ) }
		//		/>
		//	</PostListFetcher>
		//);
	}
} );

const Posts = connect(
	( state, { siteId, query, page, hasSites } ) => {
		if ( ! hasSites ) {
			return { loading: true };
		}

		const lastPage = getSitePostsLastPageForQuery( state, siteId, query );

		return {
			posts: getSitePostsForQueryIgnoringPage( state, siteId, query ) || [],
			loading: isRequestingSitePostsForQueryIgnoringPage( state, siteId, query ),
			lastPage: isNumber( lastPage ) && ( page >= lastPage ),
			// assess which of these from PostListFetcher to replicate:
			//	listId: postListStore.getID(),
			//	posts: postListStore.getAll(),
			//	postImages: PostContentImagesStore.getAll(),
			//	page: postListStore.getPage(),
			//	lastPage: postListStore.isLastPage(),
			//	loading: postListStore.isFetchingNextPage(),
			//	hasRecentError: postListStore.hasRecentError()
		};
	}
)( React.createClass( {

	propTypes: {
		query: React.PropTypes.object.isRequired,
		incrementPage: React.PropTypes.func.isRequired,
		siteId: React.PropTypes.number,

		//author: React.PropTypes.number,
		context: React.PropTypes.object.isRequired,
		//hasRecentError: React.PropTypes.bool.isRequired,
		//lastPage: React.PropTypes.bool.isRequired,
		loading: React.PropTypes.bool.isRequired,
		page: React.PropTypes.number.isRequired,
		postImages: React.PropTypes.object.isRequired,
		posts: React.PropTypes.array.isRequired,
		search: React.PropTypes.string,
		hasSites: React.PropTypes.bool.isRequired,
		statusSlug: React.PropTypes.string,
		trackScrollPage: React.PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
			hasRecentError: false,
			loading: false,
			lastPage: false,
			page: 0,
			postImages: {},
			posts: [],
			trackScrollPage: function() {}
		};
	},

	getInitialState: function() {
		return {
			postsAtFullWidth: window.innerWidth >= 960
		};
	},

	componentDidMount: function() {
		debug( 'Posts React component mounted.' );
		this.debouncedAfterResize = debounce( this.afterResize, 300 );
		window.addEventListener( 'resize', this.debouncedAfterResize );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.debouncedAfterResize );
	},

	shouldComponentUpdate: function( nextProps ) {
		if ( nextProps.loading !== this.props.loading ) {
			return true;
		}
		if ( nextProps.hasRecentError !== this.props.hasRecentError ) {
			return true;
		}
		if ( nextProps.lastPage !== this.props.lastPage ) {
			return true;
		}
		if ( nextProps.statusSlug !== this.props.statusSlug ) {
			return true;
		}
		if ( ! isEqual( nextProps.posts.map( post => post.ID ), this.props.posts.map( post => post.ID ) ) ) {
			return true;
		}
		return false;
	},

	afterResize: function() {
		var arePostsAtFullWidth = window.innerWidth >= 960;

		if ( this.state.postsAtFullWidth !== arePostsAtFullWidth ) {
			this.setState( {
				postsAtFullWidth: arePostsAtFullWidth
			} );
		}
	},

	fetchPosts: function( options ) {
		debug( 'fetchPosts', options );
		if ( this.props.loading || this.props.lastPage || this.props.hasRecentError ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		this.props.incrementPage();
	},

	getNoContentMessage: function() {
		var attributes, newPostLink;

		if ( this.props.search ) {
			return <NoResults
				image="/calypso/images/posts/illustration-posts.svg"
				text={
					this.translate( 'No posts match your search for {{searchTerm/}}.', {
						components: {
							searchTerm: <em>{ this.props.search }</em>
						}
					} )	}
			/>;
		} else {
			newPostLink = this.props.siteId ? '/post/' + this.props.siteId : '/post';

			if ( this.props.hasRecentError ) {
				attributes = {
					title: this.translate( 'Oh, no! We couldn\'t fetch your posts.' ),
					line: this.translate( 'Please check your internet connection.' )
				};
			} else {
				switch ( this.props.statusSlug ) {
					case 'drafts':
						attributes = {
							title: this.translate( 'You don\'t have any drafts.' ),
							line: this.translate( 'Would you like to create one?' ),
							action: this.translate( 'Start a Post' ),
							actionURL: newPostLink
						};
						break;
					case 'scheduled':
						attributes = {
							title: this.translate( 'You don\'t have any scheduled posts.' ),
							line: this.translate( 'Would you like to schedule a draft to publish?' ),
							action: this.translate( 'Edit Drafts' ),
							actionURL: ( this.props.siteId ) ? '/posts/drafts/' + this.props.siteId : '/posts/drafts'
						};
						break;
					case 'trashed':
						attributes = {
							title: this.translate( 'You don\'t have any posts in your trash folder.' ),
							line: this.translate( 'Everything you write is solid gold.' )
						};
						break;
					default:
						attributes = {
							title: this.translate( 'You haven\'t published any posts yet.' ),
							line: this.translate( 'Would you like to publish your first post?' ),
							action: this.translate( 'Start a Post' ),
							actionURL: newPostLink
						};
				}
			}
		}

		attributes.illustration = '/calypso/images/posts/illustration-posts.svg';
		attributes.illustrationWidth = 150;

		return <EmptyContent
			title={ attributes.title }
			line={ attributes.line }
			action={ attributes.action }
			actionURL={ attributes.actionURL }
			illustration={ attributes.illustration }
			illustrationWidth={ attributes.illustrationWidth }
		/>;
	},

	getPostRef: function( post ) {
		return post.global_ID;
	},

	renderLoadingPlaceholders: function() {
		return (
			<PostPlaceholder key={ 'placeholder-scroll-' + this.props.page } />
		);
	},

	renderPost: function( post, index ) {
		const postImages = this.props.postImages[ post.global_ID ];
		const renderedPost = (
			<Post
				ref={ post.global_ID }
				key={ post.global_ID }
				post={ post }
				postImages={ postImages }
				fullWidthPost={ this.state.postsAtFullWidth }
				path={ route.sectionify( this.props.context.pathname ) }
			/>
		);

		if ( index === 2 && this.props.selectedSiteId && ! this.props.statusSlug ) {
			return (
				<div key={ post.global_ID }>
					<UpgradeNudge
						title={ this.translate( 'No Ads with WordPress.com Premium' ) }
						message={ this.translate( 'Prevent ads from showing on your site.' ) }
						feature="no-adverts"
						event="published_posts_no_ads"
					/>
					{ renderedPost }
				</div>
			);
		} else {
			return renderedPost;
		}
	},

	render: function() {
		var posts = this.props.posts,
			placeholderCount = 1,
			placeholders = [],
			postList,
			i;

		// posts have loaded, sites have loaded, and we have a site instance or are viewing all-sites
		if ( posts.length && this.props.hasSites ) {
			postList = (
				<InfiniteList
					key={ 'list-' + this.props.listId } // to reset scroll for new list
					className="posts__list"
					items={ posts }
					lastPage={ this.props.lastPage }
					fetchingNextPage={ this.props.loading }
					guessedItemHeight={ GUESSED_POST_HEIGHT }
					fetchNextPage={ this.fetchPosts }
					getItemRef={ this.getPostRef }
					renderItem={ this.renderPost }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
				/>
			);
		} else {
			if ( this.props.loading || ! this.props.hasSites ) {
				for ( i = 0; i < placeholderCount; i++ ) {
					placeholders.push( <PostPlaceholder key={ 'placeholder-' + i } /> );
				}
			} else {
				placeholders = this.getNoContentMessage();
			}

			postList = (
				<div className="posts__list">
					{ placeholders }
				</div>
			);
		}

		return (
			<div>
				{ postList }
				{ this.props.lastPage && posts.length ? <div className="infinite-scroll-end" /> : null }
			</div>
		);
	}
} ) );

export default connect(
	( state ) => ( {
		selectedSiteId: getSelectedSiteId( state ),
		hasSites: hasInitializedSites( state ),
	} )
)( PostList );
