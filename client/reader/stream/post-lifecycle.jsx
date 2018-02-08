/** @format */
/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { omit, includes } from 'lodash';

/**
 * Internal Dependencies
 */
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import ListGap from 'reader/list-gap';
import CrossPost from './x-post';
import { shallowEquals } from 'reader/utils';
import RecommendedPosts from './recommended-posts';
import XPostHelper, { isXPost } from 'reader/xpost-helper';
import PostBlocked from 'blocks/reader-post-card/blocked';
import Post from './post';
import { IN_STREAM_RECOMMENDATION } from 'reader/follow-sources';
import CombinedCard from 'blocks/reader-combined-card';
import EmptySearchRecommendedPost from './empty-search-recommended-post';
import { getPostByKey } from 'state/reader/posts/selectors';

class PostLifecycle extends React.Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		isDiscoverStream: PropTypes.bool,
		handleClick: PropTypes.func,
		recStoreId: PropTypes.string,
	};

	shouldComponentUpdate( nextProps ) {
		const currentPropsToCompare = omit( this.props, 'handleClick' );
		const nextPropsToCompare = omit( nextProps, 'handleClick' );

		return ! shallowEquals( currentPropsToCompare, nextPropsToCompare );
	}

	render() {
		const { post, postKey, selectedPostKey, recStoreId, followSource } = this.props;

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
				<CombinedCard
					postKey={ postKey }
					index={ this.props.index }
					onClick={ this.props.handleClick }
					selectedPostKey={ selectedPostKey }
					followSource={ followSource }
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
		} else if ( ! post.is_external && includes( this.props.blockedSites, +post.site_ID ) ) {
			return <PostBlocked post={ post } />;
		} else if ( isXPost( post ) ) {
			const xMetadata = XPostHelper.getXPostMetadata( post );
			const xPostedTo = this.props.postsStore.getSitesCrossPostedTo(
				xMetadata.commentURL || xMetadata.postURL
			);
			return (
				<CrossPost
					{ ...omit( this.props, 'store' ) }
					xPostedTo={ xPostedTo }
					xMetadata={ xMetadata }
					post={ post }
					postKey={ postKey }
				/>
			);
		}

		const xPostedTo = this.props.postsStore.getSitesCrossPostedTo( post.URL );
		return <Post { ...this.props } xPostedTo={ xPostedTo } />;
	}
}

export default connect( ( state, ownProps ) => ( {
	post: getPostByKey( state, ownProps.postKey ),
} ) )( PostLifecycle );
