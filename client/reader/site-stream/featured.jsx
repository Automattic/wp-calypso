/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import Card from 'components/card';
import page from 'page';
import PostStore from 'lib/feed-post-store';
import FeedPostStoreActions from 'lib/feed-post-store/actions';

export default React.createClass( {
	displayName: 'FeedFeatured',

	getInitialState() {
		return this.getStateFromStores();
	},

	getStateFromStores( store ) {
		store = store || this.props.store;
		return {
			posts: store.get()
		};
	},

	updateState( store ) {
		this.setState( this.getStateFromStores( store ) );
	},

	componentDidMount() {
		this.props.store.on( 'change', this.updateState );
		PostStore.on( 'change', this.updateState );
	},

	componentWillUnmount() {
		this.props.store.off( 'change', this.updateState );
		PostStore.off( 'change', this.updateState );
	},

	handleClick( post ) {
		page( '/read/post/id/' + post.site_ID + '/' + post.ID );
	},

	renderPosts() {
		return this.state.posts.map( postKey => {
			let post = PostStore.get( postKey );
			let postState = post._state;
			if ( ! post || postState === 'minimal' ) {
				FeedPostStoreActions.fetchPost( postKey );
				postState = 'pending';
			}

			switch ( postState ) {
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
							onClick={ this.handleClick.bind( this, post ) }
							style={ style }>
							<h2>{ post.title }</h2>
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
			<Card>
				<div className="reader__featured-header">
					<div className="reader__featured-title">{ this.translate( 'Featured' ) }</div>
					<div className="reader__featured-description">{ this.translate( 'Stories interviews, and more from the editors at WordPress.com.' ) }</div>
				</div>

				<div className="reader__featured-posts">
					{ this.renderPosts() }
				</div>
			</Card>
		);
	}
} );
