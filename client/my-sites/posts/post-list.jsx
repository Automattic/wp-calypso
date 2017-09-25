/**
 * External dependencies
 */
import debugFactory from 'debug';
import { localize } from 'i18n-calypso';
import { debounce, isEqual, omit } from 'lodash';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import Post from './post';
import PostPlaceholder from './post-placeholder';
import EmptyContent from 'components/empty-content';
import InfiniteList from 'components/infinite-list';
import ListEnd from 'components/list-end';
import PostListFetcher from 'components/post-list-fetcher';
import actions from 'lib/posts/actions';
import { mapPostStatus as mapStatus, sectionify } from 'lib/route';
import NoResults from 'my-sites/no-results';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { hasInitializedSites } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const debug = debugFactory( 'calypso:my-sites:posts' );

const GUESSED_POST_HEIGHT = 250;

class PostList extends PureComponent {
	static propTypes = {
		context: PropTypes.object,
		search: PropTypes.string,
		category: PropTypes.string,
		tag: PropTypes.string,
		hasSites: PropTypes.bool,
		statusSlug: PropTypes.string,
		siteId: PropTypes.number,
		author: PropTypes.number
	};

	render() {
		return (
			<PostListFetcher
				siteId={ this.props.siteId }
				status={ mapStatus( this.props.statusSlug ) }
				author={ this.props.author }
				withImages={ true }
				withCounts={ true }
				search={ this.props.search }
				category={ this.props.category }
				tag={ this.props.tag }
			>
				<Posts
					{ ...omit( this.props, 'children' ) }
				/>
			</PostListFetcher>
		);
	}
}

const Posts = localize( class extends React.Component {
	static propTypes = {
		author: PropTypes.number,
		context: PropTypes.object.isRequired,
		hasRecentError: PropTypes.bool.isRequired,
		lastPage: PropTypes.bool.isRequired,
		loading: PropTypes.bool.isRequired,
		page: PropTypes.number.isRequired,
		postImages: PropTypes.object.isRequired,
		posts: PropTypes.array.isRequired,
		search: PropTypes.string,
		siteId: PropTypes.number,
		hasSites: PropTypes.bool.isRequired,
		statusSlug: PropTypes.string,
		trackScrollPage: PropTypes.func.isRequired
	};

	static defaultProps = {
		hasRecentError: false,
		loading: false,
		lastPage: false,
		page: 0,
		postImages: {},
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
	}

	afterResize = () => {
		const arePostsAtFullWidth = window.innerWidth >= 960;

		if ( this.state.postsAtFullWidth !== arePostsAtFullWidth ) {
			this.setState( {
				postsAtFullWidth: arePostsAtFullWidth
			} );
		}
	};

	fetchPosts = options => {
		if ( this.props.loading || this.props.lastPage || this.props.hasRecentError ) {
			return;
		}
		if ( options.triggeredByScroll ) {
			this.props.trackScrollPage( this.props.page + 1 );
		}
		actions.fetchNextPage();
	};

	getNoContentMessage = () => {
		const { hasRecentError, siteId, search, statusSlug, translate } = this.props;
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
			<PostPlaceholder key={ 'placeholder-scroll-' + this.props.page } />
		);
	};

	renderPost = ( post, index ) => {
		const postImages = this.props.postImages[ post.global_ID ];
		const renderedPost = (
			<Post
				ref={ post.global_ID }
				key={ post.global_ID }
				post={ post }
				postImages={ postImages }
				fullWidthPost={ this.state.postsAtFullWidth }
				path={ sectionify( this.props.context.pathname ) }
			/>
		);

		if ( index === 2 && this.props.selectedSiteId && ! this.props.statusSlug ) {
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

export default connect(
	( state ) => ( {
		selectedSiteId: getSelectedSiteId( state ),
		hasSites: hasInitializedSites( state )
	} )
)( PostList );
