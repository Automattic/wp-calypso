/**
 * External dependencies
 */
var React = require( 'react' ),
	PureRenderMixin = require( 'react-pure-render/mixin' ),
	debug = require( 'debug' )( 'calypso:my-sites:posts' ),
	debounce = require( 'lodash/debounce' ),
	omit = require( 'lodash/omit' ),
	isEqual = require( 'lodash/isEqual' );

/**
 * Internal dependencies
 */
var PostListFetcher = require( 'components/post-list-fetcher' ),
	Post = require( './post' ),
	PostPlaceholder = require( './post-placeholder' ),
	actions = require( 'lib/posts/actions' ),
	observe = require( 'lib/mixins/data-observe' ),
	EmptyContent = require( 'components/empty-content' ),
	InfiniteList = require( 'components/infinite-list' ),
	NoResults = require( 'my-sites/no-results' ),
	route = require( 'lib/route' ),
	mapStatus = route.mapPostStatus;

import UpgradeNudge from 'my-sites/upgrade-nudge';

var GUESSED_POST_HEIGHT = 250;

var PostList = React.createClass( {

	mixins: [ PureRenderMixin ],

	propTypes: {
		context: React.PropTypes.object,
		search: React.PropTypes.string,
		sites: React.PropTypes.object,
		statusSlug: React.PropTypes.string,
		siteID: React.PropTypes.any,
		author: React.PropTypes.number
	},

	render: function() {
		return (
			<PostListFetcher
				siteID={ this.props.siteID }
				status={ mapStatus( this.props.statusSlug ) }
				author={ this.props.author }
				withImages={ true }
				withCounts={ true }
				search={ this.props.search }>
				<Posts
					{ ...omit( this.props, 'children' ) }
				/>
			</PostListFetcher>
		);
	}
} );


var Posts = React.createClass( {

	propTypes: {
		author: React.PropTypes.number,
		context: React.PropTypes.object.isRequired,
		hasRecentError: React.PropTypes.bool.isRequired,
		lastPage: React.PropTypes.bool.isRequired,
		loading: React.PropTypes.bool.isRequired,
		page: React.PropTypes.number.isRequired,
		postImages: React.PropTypes.object.isRequired,
		posts: React.PropTypes.array.isRequired,
		search: React.PropTypes.string,
		siteID: React.PropTypes.any,
		sites: React.PropTypes.object.isRequired,
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

	mixins: [ observe( 'sites' ) ],

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
		if ( this.props.loading || this.props.lastPage || this.props.hasRecentError ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		actions.fetchNextPage();
	},

	getNoContentMessage: function() {
		var selectedSite = this.props.sites.getSelectedSite(),
			attributes, newPostLink;

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
			newPostLink = this.props.siteID ? '/post/' + this.props.siteID : '/post';

			if ( this.props.hasRecentError ) {
				attributes = {
					title: this.translate( 'Oh, no! We couldn\'t fetch your posts.' ),
					line: this.translate( 'Please check your internet connection.' )
				}
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
							actionURL: ( this.props.siteID ) ? '/posts/drafts/' + this.props.siteID : '/posts/drafts'
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
				sites={ this.props.sites }
				fullWidthPost={ this.state.postsAtFullWidth }
				path={ route.sectionify( this.props.context.pathname ) }
			/>
		);

		if ( index === 2 && this.props.sites.getSelectedSite() && ! this.props.statusSlug ) {
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
		if ( posts.length && this.props.sites.initialized ) {
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
			if ( this.props.loading || ! this.props.sites.fetched ) {
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
} );

module.exports = PostList;
