/** @format */
var React = require( 'react' ),
	debug = require( 'debug' )( 'calypso:my-sites:posts' );

/**
 * External dependencies
 */
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import { debounce, isEqual, omit } from 'lodash';

/**
 * Internal dependencies
 */
var PostListFetcher = require( 'components/post-list-fetcher' ),
	Post = require( './post' ),
	PostPlaceholder = require( './post-placeholder' ),
	actions = require( 'lib/posts/actions' ),
	EmptyContent = require( 'components/empty-content' ),
	InfiniteList = require( 'components/infinite-list' ),
	NoResults = require( 'my-sites/no-results' ),
	route = require( 'lib/route' ),
	mapStatus = route.mapPostStatus;

import ListEnd from 'components/list-end';
import UpgradeNudge from 'my-sites/upgrade-nudge';
import { hasInitializedSites } from 'state/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

var GUESSED_POST_HEIGHT = 250;

class PostList extends React.PureComponent {
	static propTypes = {
		context: PropTypes.object,
		search: PropTypes.string,
		category: PropTypes.string,
		tag: PropTypes.string,
		hasSites: PropTypes.bool,
		statusSlug: PropTypes.string,
		siteId: PropTypes.number,
		author: PropTypes.number,
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
				<Posts { ...omit( this.props, 'children' ) } />
			</PostListFetcher>
		);
	}
}

var Posts = localize(
	class extends React.Component {
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
			trackScrollPage: PropTypes.func.isRequired,
		};

		static defaultProps = {
			hasRecentError: false,
			loading: false,
			lastPage: false,
			page: 0,
			postImages: {},
			posts: [],
			trackScrollPage: function() {},
		};

		state = {
			postsAtFullWidth: window.innerWidth >= 960,
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
			if (
				! isEqual( nextProps.posts.map( post => post.ID ), this.props.posts.map( post => post.ID ) )
			) {
				return true;
			}
			return false;
		}

		afterResize = () => {
			var arePostsAtFullWidth = window.innerWidth >= 960;

			if ( this.state.postsAtFullWidth !== arePostsAtFullWidth ) {
				this.setState( {
					postsAtFullWidth: arePostsAtFullWidth,
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
			var attributes, newPostLink;

			if ( this.props.search ) {
				return (
					<NoResults
						image="/calypso/images/posts/illustration-posts.svg"
						text={ this.props.translate( 'No posts match your search for {{searchTerm/}}.', {
							components: {
								searchTerm: (
									<em>
										{ this.props.search }
									</em>
								),
							},
						} ) }
					/>
				);
			} else {
				newPostLink = this.props.siteId ? '/post/' + this.props.siteId : '/post';

				if ( this.props.hasRecentError ) {
					attributes = {
						title: this.props.translate( "Oh, no! We couldn't fetch your posts." ),
						line: this.props.translate( 'Please check your internet connection.' ),
					};
				} else {
					switch ( this.props.statusSlug ) {
						case 'drafts':
							attributes = {
								title: this.props.translate( "You don't have any drafts." ),
								line: this.props.translate( 'Would you like to create one?' ),
								action: this.props.translate( 'Start a Post' ),
								actionURL: newPostLink,
							};
							break;
						case 'scheduled':
							attributes = {
								title: this.props.translate( "You don't have any scheduled posts." ),
								line: this.props.translate( 'Would you like to schedule a draft to publish?' ),
								action: this.props.translate( 'Edit Drafts' ),
								actionURL: this.props.siteId
									? '/posts/drafts/' + this.props.siteId
									: '/posts/drafts',
							};
							break;
						case 'trashed':
							attributes = {
								title: this.props.translate( "You don't have any posts in your trash folder." ),
								line: this.props.translate( 'Everything you write is solid gold.' ),
							};
							break;
						default:
							attributes = {
								title: this.props.translate( "You haven't published any posts yet." ),
								line: this.props.translate( 'Would you like to publish your first post?' ),
								action: this.props.translate( 'Start a Post' ),
								actionURL: newPostLink,
							};
					}
				}
			}

			attributes.illustration = '/calypso/images/posts/illustration-posts.svg';
			attributes.illustrationWidth = 150;

			return (
				<EmptyContent
					title={ attributes.title }
					line={ attributes.line }
					action={ attributes.action }
					actionURL={ attributes.actionURL }
					illustration={ attributes.illustration }
					illustrationWidth={ attributes.illustrationWidth }
				/>
			);
		};

		getPostRef = post => {
			return post.global_ID;
		};

		renderLoadingPlaceholders = () => {
			return <PostPlaceholder key={ 'placeholder-scroll-' + this.props.page } />;
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
					path={ route.sectionify( this.props.context.pathname ) }
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
			} else {
				return renderedPost;
			}
		};

		render() {
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
					{ this.props.lastPage && posts.length ? <ListEnd /> : null }
				</div>
			);
		}
	}
);

export default connect( state => ( {
	selectedSiteId: getSelectedSiteId( state ),
	hasSites: hasInitializedSites( state ),
} ) )( PostList );
