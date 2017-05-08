/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { defer, omit, includes } from 'lodash';

/**
 * Internal Dependencies
 */
import PostStore from 'lib/feed-post-store';
import PostStoreActions from 'lib/feed-post-store/actions';
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import ListGap from 'reader/list-gap';
import CrossPost from './x-post';
import { shallowEquals } from 'reader/utils';
import RecommendedPosts from './recommended-posts';
import XPostHelper, { isXPost } from 'reader/xpost-helper';
import PostBlocked from 'blocks/reader-post-card/blocked';
import Post from './post';
import { IN_STREAM_RECOMMENDATION, COMBINED_CARD, } from 'reader/follow-button/follow-sources';
import CombinedCard from 'blocks/reader-combined-card';
import fluxPostAdapter from 'lib/reader-post-flux-adapter';
import EmptySearchRecommendedPost from './empty-search-recommended-post';

const ConnectedCombinedCard = fluxPostAdapter( CombinedCard );

export default class PostLifecycle extends React.PureComponent {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		isDiscoverStream: PropTypes.bool,
		handleClick: PropTypes.func,
		recStoreId: PropTypes.string,
	}

	state = {
		post: this.getPostFromStore()
	}

	getPostFromStore( props = this.props ) {
		if (
			props.postKey.isRecommendationBlock ||
			props.postKey.isCombination ||
			props.postKey.isGap
		) {
			return null;
		}

		const post = PostStore.get( props.postKey );
		if ( ! post || post._state === 'minimal' ) {
			defer( () => PostStoreActions.fetchPost( props.postKey ) );
		}
		return post;
	}

	updatePost = ( props = this.props ) => {
		const post = this.getPostFromStore( props );
		if ( post !== this.state.post ) {
			this.setState( { post } );
		}
	}

	componentWillMount() {
		PostStore.on( 'change', this.updatePost );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updatePost );
	}

	componentWillReceiveProps( nextProps ) {
		this.updatePost( nextProps );
	}

	shouldComponentUpdate( nextProps, nextState ) {
		const currentPropsToCompare = omit( this.props, 'handleClick' );
		const nextPropsToCompare = omit( nextProps, 'handleClick' );
		const shouldUpdate = this.state.post !== nextState.post ||
			! shallowEquals( currentPropsToCompare, nextPropsToCompare );

		return shouldUpdate;
	}

	render() {
		const post = this.state.post;
		const { postKey, selectedPostKey, recStoreId } = this.props;

		if ( postKey.isRecommendationBlock ) {
			return (
				<RecommendedPosts
					recommendations={ postKey.recommendations }
					index={ postKey.index }
					storeId={ recStoreId }
					followSource={ IN_STREAM_RECOMMENDATION }
				/>
			);
		} else if ( postKey.isCombination ) {
			return (
				<ConnectedCombinedCard
					postKey={ postKey }
					index={ this.props.index }
					onClick={ this.props.handleClick }
					selectedPostKey={ selectedPostKey }
					followSource={ COMBINED_CARD }
					showFollowButton={ this.props.showPrimaryFollowButtonOnCards }
				/>
			);
		} else if ( postKey.isRecommendation ) {
			return <EmptySearchRecommendedPost post={ post } site={ postKey } />;
		} else if ( postKey.isGap ) {
			return (
				<ListGap
					gap={ postKey }
					store={ this.props.store }
					selected={ this.props.isSelected }
					handleClick={ this.props.handleClick }
				/>
			);
		} else if ( ! post || post._state === 'minimal' || post._state === 'pending' ) {
			return <PostPlaceholder />;
		} else if ( post._state === 'error' ) {
			return <PostUnavailable post={ post } />;
		} else if ( includes( this.props.blockedSites, +postKey.blogId ) ) {
			return <PostBlocked post={ post } />;
		} else if ( isXPost( post ) ) {
			const xMetadata = XPostHelper.getXPostMetadata( post );
			const xPostedTo = this.props.store.getSitesCrossPostedTo( xMetadata.commentURL || xMetadata.postURL );
			return <CrossPost
								{ ...omit( this.props, 'store' ) }
								xPostedTo={ xPostedTo }
								xMetadata={ xMetadata }
								post={ post }
								postKey={ postKey }
							/>;
		}

		const xPostedTo = this.props.store.getSitesCrossPostedTo( post.URL );
		return <Post { ...omit( this.props, 'store' ) } post={ post } xPostedTo={ xPostedTo } />;
	}
}
