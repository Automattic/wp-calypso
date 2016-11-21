/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { debounce, get, isEqual, map, range } from 'lodash';

/**
 * Internal dependencies
 */
var Post = require( './post' ),
	PostPlaceholder = require( './post-placeholder' ),
	observe = require( 'lib/mixins/data-observe' ),
	EmptyContent = require( 'components/empty-content' ),
	InfiniteList = require( 'components/infinite-list' ),
	NoResults = require( 'my-sites/no-results' ),
	route = require( 'lib/route' ),
	mapStatus = route.mapPostStatus;

import queryGraph from 'lib/graph/query';
import UpgradeNudge from 'my-sites/upgrade-nudge';

const GUESSED_POST_HEIGHT = 250;

class PostList extends Component {
	static propTypes = {
		context: PropTypes.object,
		search: PropTypes.string,
		sites: PropTypes.object,
		statusSlug: PropTypes.string,
		siteID: PropTypes.any,
		author: PropTypes.number
	};

	state = {
		page: 1
	};

	fetchNextPage = () => {
		this.setState( {
			page: this.state.page + 1
		} );
	};

	render() {
		return (
			<Posts
				sites={ this.props.sites }
				context={ this.props.context }
				siteID={ this.props.sites.getSelectedSite().ID }
				status={ mapStatus( this.props.statusSlug ) }
				author={ this.props.author }
				search={ this.props.search }
				page={ this.state.page }
				fetchNextPage={ this.fetchNextPage }
			/>
		);
	}
}

var PostsUnwrapped = React.createClass( {

	propTypes: {
		author: PropTypes.number,
		context: PropTypes.object.isRequired,
		hasRecentError: PropTypes.bool.isRequired,
		lastPage: PropTypes.bool.isRequired,
		loading: PropTypes.bool.isRequired,
		page: PropTypes.number.isRequired,
		postImages: PropTypes.object.isRequired,
		search: PropTypes.string,
		siteID: PropTypes.any,
		sites: PropTypes.object.isRequired,
		statusSlug: PropTypes.string,
		trackScrollPage: PropTypes.func.isRequired,
		fetchNextPage: PropTypes.func.isRequired
	},

	getDefaultProps: function() {
		return {
			hasRecentError: false,
			loading: false,
			lastPage: false,
			page: 0,
			postImages: {},
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
		this.debouncedAfterResize = debounce( this.afterResize, 300 );
		window.addEventListener( 'resize', this.debouncedAfterResize );
	},

	componentWillUnmount: function() {
		window.removeEventListener( 'resize', this.debouncedAfterResize );
	},

	shouldComponentUpdate: function( nextProps ) {
		if ( get( nextProps.results, [ 'posts', 'requesting' ] ) !==  get( this.props.results, [ 'posts', 'requesting' ] ) ) {
			return true;
		}
		if ( nextProps.hasRecentError !== this.props.hasRecentError ) {
			return true;
		}
		if ( get( nextProps.results, [ 'posts', 'lastPage' ] ) !== get( this.props.results, [ 'posts', 'lastPage' ] ) ) {
			return true;
		}
		if ( ! isEqual(
			map( get( nextProps.results, [ 'posts', 'items' ], [] ), post => post.ID ),
			map( get( this.props.results, [ 'posts', 'items' ], [] ), post => post.ID )
		) ) {
			return true;
		}
		return false;
	},

	afterResize: function() {
		const arePostsAtFullWidth = window.innerWidth >= 960;
		if ( this.state.postsAtFullWidth !== arePostsAtFullWidth ) {
			this.setState( {
				postsAtFullWidth: arePostsAtFullWidth
			} );
		}
	},

	fetchPosts: function( options ) {
		const loading = get( this.props.results, [ 'posts', 'requesting' ] );
		const lastPage = get( this.props.results, [ 'posts', 'lastPage' ] );
		if ( loading || this.props.page === lastPage || this.props.hasRecentError ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page );
		}
		this.props.fetchNextPage();
	},

	getNoContentMessage: function() {
		let attributes, newPostLink;

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
		const posts = get( this.props.results, [ 'posts', 'items' ], [] ) || [];
		const loading = get( this.props.results, [ 'posts', 'requesting' ], false );
		const lastPage = get( this.props.results, [ 'posts', 'lastPage' ] );
		const placeholderCount = 1;
		let placeholders = [];
		let postList;

		// posts have loaded, sites have loaded, and we have a site instance or are viewing all-sites
		if ( posts.length && this.props.sites.initialized ) {
			postList = (
				<InfiniteList
					key={ 'list-' + this.props.listId } // to reset scroll for new list
					className="posts__list"
					items={ posts }
					lastPage={ this.props.page === lastPage }
					fetchingNextPage={ loading }
					guessedItemHeight={ GUESSED_POST_HEIGHT }
					fetchNextPage={ this.fetchPosts }
					getItemRef={ this.getPostRef }
					renderItem={ this.renderPost }
					renderLoadingPlaceholders={ this.renderLoadingPlaceholders }
				/>
			);
		} else {
			if ( loading || ! this.props.sites.fetched ) {
				for ( let i = 0; i < placeholderCount; i++ ) {
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

const Posts = queryGraph(
	`
		query PostList( $siteId: Int, $status: String, $author: Int, $search: String, $pages: [Int] )
		{
			posts( siteId: $siteId, query: { status: $status, author: $author, search: $search }, pages: $pages ) {
				items {
					ID
					author {
						name
					}
					canonical_image
					capabilities {
						edit_post
					}
					date
					discussion {
						comment_count
						comments_open
					}
					excerpt
					format
					global_ID
					password
					like_count
					likes_enabled
					site_ID
					status
					title
					type
					URL
				}
				requesting
				lastPage
			}
		}
	`,
	( { siteID: siteId, author, search, status, page } ) => {
		return {
			pages: range( 1, page + 1 ),
			author,
			siteId,
			search,
			status,
		};
	}
)( PostsUnwrapped );


module.exports = PostList;
