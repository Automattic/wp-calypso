/**
 * External dependencies
 */
import React, { Component, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { debounce, isEqual } from 'lodash';
import { localize } from 'i18n-calypso';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import QueryPosts from 'components/data/query-posts';
import Post from './post';
import PostPlaceholder from './post-placeholder';
import EmptyContent from 'components/empty-content';
import InfiniteList from 'components/infinite-list';
import NoResults from 'my-sites/no-results';
import { mapPostStatus as mapStatus, sectionify } from 'lib/route';
import ListEnd from 'components/list-end';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { hasInitializedSites } from 'state/selectors';
import {
	getSitePostsForQueryIgnoringPage,
	isRequestingSitePostsForQuery,
	isSitePostsLastPageForQuery,
 } from 'state/posts/selectors';

const debug = debugFactory( 'calypso:my-sites:posts' );

const GUESSED_POST_HEIGHT = 250;

class PostList extends PureComponent {
	static propTypes = {
		context: PropTypes.object,
		search: PropTypes.string,
		category: PropTypes.string,
		tag: PropTypes.string,
		statusSlug: PropTypes.string,
		siteId: PropTypes.number,
		author: PropTypes.number
	};

	state = {
		page: 1,
	}

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.author !== this.props.author ||
			nextProps.search !== this.props.search ||
			nextProps.siteId !== this.props.siteId ||
			nextProps.status !== this.props.status ) {
			this.resetPage();
		}
	}

	incrementPage = () => {
		this.setState( { page: this.state.page + 1 } );
	}

	resetPage = () => {
		this.setState( { page: 1 } );
	}

	render() {
		const { author, category, context, search, siteId, statusSlug, tag } = this.props;
		const query = {
			page: this.state.page,
			number: 20, // all-sites mode, i.e the /me/posts endpoint, only supports up to 20 results at a time
			author,
			category,
			search,
			status: mapStatus( statusSlug ),
			tag,
			type: 'post'
		};

		return (
			<div>
				<QueryPosts siteId={ siteId }
					query={ query }
					largeTitles={ true }
					wrapTitles={ true }
				/>
				<ConnectedPosts
					incrementPage={ this.incrementPage }
					pathname={ context.pathname }
					query={ query }
					siteId={ siteId }
					statusSlug={ statusSlug } />
			</div>
		);
	}
}

const Posts = localize( class extends Component {
	static propTypes = {
		lastPage: PropTypes.bool.isRequired,
		loading: PropTypes.bool.isRequired,
		pathname: PropTypes.string.isRequired,
		posts: PropTypes.array.isRequired,
		query: PropTypes.shape( {
			page: PropTypes.number,
			number: PropTypes.number,
			author: PropTypes.number,
			category: PropTypes.string,
			search: PropTypes.string,
			status: PropTypes.oneOf( [ 'draft,pending', 'future', 'trash', 'publish,private' ] ),
			tag: PropTypes.string,
			type: PropTypes.oneOf( [ 'post' ] ),
		} ),
		siteId: PropTypes.number,
		hasSites: PropTypes.bool.isRequired,
		statusSlug: PropTypes.string,
		trackScrollPage: PropTypes.func.isRequired
	};

	static defaultProps = {
		loading: false,
		lastPage: false,
		posts: [],
		trackScrollPage: function() {}
	};

	state = {
		postsAtFullWidth: window.innerWidth >= 960
	};

	componentDidMount() {
		debug( 'Posts React component mounted.' );
		this.debouncedAfterResize = debounce( this.afterResize, 300 );
		window.addEventListener( 'resize', this.debouncedAfterResize );
	}

	componentWillUnmount() {
		window.removeEventListener( 'resize', this.debouncedAfterResize );
	}

	shouldComponentUpdate( nextProps ) {
		if ( nextProps.loading !== this.props.loading ) {
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
	}

	afterResize = () => {
		const arePostsAtFullWidth = window.innerWidth >= 960;

		if ( this.state.postsAtFullWidth !== arePostsAtFullWidth ) {
			this.setState( {
				postsAtFullWidth: arePostsAtFullWidth
			} );
		}
	};

	fetchPosts = ( options ) => {
		if ( this.props.loading || this.props.lastPage ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.query.page + 1 );
		}
		this.props.incrementPage();
	};

	getNoContentMessage = () => {
		const { hasRecentError, query: { search }, siteId, statusSlug, translate } = this.props;
		let attributes;

		if ( search ) {
			return (
				<NoResults
					image="/calypso/images/posts/illustration-posts.svg"
					text={
						translate( 'No posts match your search for {{searchTerm/}}.', {
							components: {
								searchTerm: <em>{ search }</em>
							}
						} )	}
				/>
			);
		}

		const newPostLink = siteId ? '/post/' + siteId : '/post';

		if ( hasRecentError ) {
			attributes = {
				title: translate( 'Oh, no! We couldn\'t fetch your posts.' ),
				line: translate( 'Please check your internet connection.' )
			};
		}

		switch ( statusSlug ) {
			case 'drafts':
				attributes = {
					title: translate( 'You don\'t have any drafts.' ),
					line: translate( 'Would you like to create one?' ),
					action: translate( 'Start a Post' ),
					actionURL: newPostLink
				};
				break;
			case 'scheduled':
				attributes = {
					title: translate( 'You don\'t have any scheduled posts.' ),
					line: translate( 'Would you like to schedule a draft to publish?' ),
					action: translate( 'Edit Drafts' ),
					actionURL: ( siteId ) ? '/posts/drafts/' + siteId : '/posts/drafts'
				};
				break;
			case 'trashed':
				attributes = {
					title: translate( 'You don\'t have any posts in your trash folder.' ),
					line: translate( 'Everything you write is solid gold.' )
				};
				break;
			default:
				attributes = {
					title: translate( 'You haven\'t published any posts yet.' ),
					line: translate( 'Would you like to publish your first post?' ),
					action: translate( 'Start a Post' ),
					actionURL: newPostLink
				};
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
	};

	getPostRef = post => {
		return post.global_ID;
	};

	renderLoadingPlaceholders = () => {
		return (
			<PostPlaceholder key={ 'placeholder-scroll-' + this.props.query.page } />
		);
	};

	renderPost = ( post, index ) => {
		const { canonical_image, featured_image } = post;
		const postImages = { canonical_image, featured_image };
		const renderedPost = (
			<Post
				ref={ post.global_ID }
				key={ post.global_ID }
				post={ post }
				postImages={ postImages }
				fullWidthPost={ this.state.postsAtFullWidth }
				path={ sectionify( this.props.pathname ) }
			/>
		);

		if ( index === 2 && this.props.siteId && ! this.props.statusSlug ) {
			return (
				<div key={ post.global_ID }>
					<UpgradeNudge
						title={ this.props.translate( 'No Ads with WordPress.com Premium' ) }
						message={ this.props.translate( 'Prevent ads from showing on your site.' ) }
						feature="no-adverts"
						event="published_posts_no_ads"
					/>
					{ renderedPost }
				</div>
			);
		}
		return renderedPost;
	};

	render() {
		const { posts } = this.props;
		const placeholderCount = 1;
		let placeholders = [],
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
				{ this.props.lastPage && posts.length ? <ListEnd /> : null }
			</div>
		);
	}
} );

const mapState = ( state, { query, siteId } ) => ( {
	hasSites: hasInitializedSites( state ),
	loading: isRequestingSitePostsForQuery( state, siteId, query ),
	lastPage: !! isSitePostsLastPageForQuery( state, siteId, query ),
	posts: getSitePostsForQueryIgnoringPage( state, siteId, query ) || [],
} );

const ConnectedPosts = connect( mapState )( Posts );

export default PostList;
