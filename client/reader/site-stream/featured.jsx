/** @format */
/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import page from 'page';
import React from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import cssSafeUrl from 'lib/css-safe-url';
import FeedPostStore from 'lib/feed-post-store';
import FeedPostStoreActions from 'lib/feed-post-store/actions';
import { getSourceData as getDiscoverSourceData } from 'reader/discover/helper';
import { recordAction, recordGaEvent, recordTrackForPost } from 'reader/stats';

export default localize(
	class extends React.PureComponent {
		static displayName = 'FeedFeatured';

		getStateFromStores = ( store = this.props.store ) => {
			const posts = store.get().map( postKey => {
				const post = FeedPostStore.get( postKey );

				if ( this.shouldFetch( post ) ) {
					FeedPostStoreActions.fetchPost( postKey );
					return { post };
				}

				const source = this.getSourcePost( post ),
					url = this.getPostUrl( source || post );

				return {
					post,
					source,
					url,
				};
			} );

			return {
				posts,
			};
		};

		updateState = store => {
			this.setState( this.getStateFromStores( store ) );
		};

		componentDidMount() {
			this.props.store.on( 'change', this.updateState );
			FeedPostStore.on( 'change', this.updateState );
		}

		componentWillUnmount() {
			this.props.store.off( 'change', this.updateState );
			FeedPostStore.off( 'change', this.updateState );
		}

		componentWillReceiveProps( nextProps ) {
			if ( nextProps.store !== this.props.store ) {
				this.updateState();
			}
		}

		shouldFetch = post => {
			return ! post || post._state === 'minimal';
		};

		getSourcePost = post => {
			const data = getDiscoverSourceData( post );

			if ( ! data ) {
				return null;
			}

			return FeedPostStore.get( data );
		};

		getPostUrl = post => {
			return '/read/blogs/' + post.site_ID + '/posts/' + post.ID;
		};

		handleClick = postData => {
			const post = postData.post;
			recordTrackForPost( 'calypso_reader_clicked_featured_post', post );
			recordAction( 'clicked_featured_post' );
			recordGaEvent( 'Clicked Featured Post' );

			page( postData.url );
		};

		renderPosts = () => {
			return this.state.posts.map( postData => {
				const post = postData.post,
					postState = post._state;

				switch ( postState ) {
					case 'minimal':
					case 'pending':
					case 'error':
						break;
					default:
						const style = {
							backgroundImage:
								post.canonical_image && post.canonical_image.uri
									? 'url(' + cssSafeUrl( post.canonical_image.uri ) + ')'
									: null,
						};

						return (
							<div
								key={ post.ID }
								className="reader__featured-post"
								onClick={ this.handleClick.bind( this, postData ) }
							>
								<div className="reader__featured-post-image" style={ style } />
								<h2 className="reader__featured-post-title">{ post.title }</h2>
							</div>
						);
				}
			} );
		};

		state = this.getStateFromStores();

		render() {
			if ( ! this.state.posts ) {
				return null;
			}

			return (
				<Card className="reader__featured-card">
					<div className="reader__featured-header">
						<div className="reader__featured-title">{ this.props.translate( 'Highlights' ) }</div>
						<div className="reader__featured-description">
							{ this.props.translate( 'What we’re reading this week.' ) }
						</div>
					</div>

					<div className="reader__featured-posts">{ this.renderPosts() }</div>
				</Card>
			);
		}
	}
);
