/**
 * External Dependencies
 */
import React from 'react';
import PureRenderMixin from 'react-pure-render/mixin';
import get from 'lodash/object/get';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import page from 'page';
import FeedPostStore from 'lib/feed-post-store';
import FeedPostStoreActions from 'lib/feed-post-store/actions';
import DiscoverHelper from 'reader/discover/helper';
import * as stats from 'reader/stats';

export default React.createClass( {
	displayName: 'FeedFeatured',

	mixins: [ PureRenderMixin ],

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( store ) {
		store = store || this.props.store;

		let postKeys = store.get();
		let posts = postKeys.map( postKey => {
			let post = FeedPostStore.get( postKey ),
				originalPost,
				isDiscoverPost;

			if ( ! post || post._state === 'minimal' ) {
				FeedPostStoreActions.fetchPost( postKey );
			} else {
				isDiscoverPost = post && DiscoverHelper.isDiscoverPost( post );

				let isDiscoverSitePick = post && isDiscoverPost && DiscoverHelper.isDiscoverSitePick( post );

				if ( isDiscoverPost && ! isDiscoverSitePick && get( post, 'discover_metadata.featured_post_wpcom_data.blog_id' ) ) {
					originalPost = FeedPostStore.get( {
						blogId: post.discover_metadata.featured_post_wpcom_data.blog_id,
						postId: post.discover_metadata.featured_post_wpcom_data.post_id
					} );
				}
			}

			return {
				post,
				originalPost,
				isDiscoverPost
			}
		} );

		return {
			posts
		};
	},

	updateState( store ) {
		this.setState( this.getStateFromStores( store ) );
	},

	componentDidMount() {
		this.props.store.on( 'change', this.updateState );
		FeedPostStore.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		this.props.store.off( 'change', this.updateState );
		FeedPostStore.off( 'change', this.updateState );
	},

	componentWillReceiveProps( nextProps ) {
		if ( nextProps.store !== this.props.store ) {
			this.updateState();
		}
	},

	handleClick( postData ) {
		let post = postData.post;
		stats.recordTrack( 'calypso_reader_clicked_featured_post', { blog_id: post.site_ID, post_id: post.ID } )
		stats.recordAction( 'clicked_featured_post' );
		stats.recordGaEvent( 'Clicked Featured Post' );

		let url;
		if ( postData.isDiscoverPost ) {
			url = '/read/post/id/' + postData.originalPost.site_ID + '/' + postData.originalPost.ID;
		} else {
			url = '/read/post/id/' + post.site_ID + '/' + post.ID;
		}

		page( url );
	},

	renderPosts() {
		return this.state.posts.map( postData => {
			let post = postData.post,
				postState = post._state;

			switch ( postState ) {
				case 'minimal':
				case 'pending':
				case 'error':
					break;
				default:
					let style = {
						backgroundImage: post.canonical_image && post.canonical_image.uri ? 'url(' + post.canonical_image.uri + ')' : null
					};

					return (
						<div
							key={ post.ID }
							className="reader__featured-post"
							onClick={ this.handleClick.bind( this, postData ) }>
							<div className="reader__featured-post-image" style={ style }></div>
							<h2 className="reader__featured-post-title">{ post.title }</h2>
						</div>
					);
			}
		} );
	},

	render() {
		if ( ! this.state.posts ) {
			return null;
		}

		return (
			<Card className="reader__featured-card">
				<div className="reader__featured-header">
					<div className="reader__featured-title">{ this.translate( 'Highlights' ) }</div>
					<div className="reader__featured-description">{ this.translate( 'What we’re reading this week.' ) }</div>
				</div>

				<div className="reader__featured-posts">
					{ this.renderPosts() }
				</div>
			</Card>
		);
	}
} );
