/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { omit, includes } from 'lodash';

/**
 * Internal Dependencies
 */
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import ListGap from 'calypso/reader/list-gap';
import CrossPost from './x-post';
import RecommendedPosts from './recommended-posts';
import XPostHelper, { isXPost } from 'calypso/reader/xpost-helper';
import PostBlocked from 'calypso/blocks/reader-post-card/blocked';
import Post from './post';
import { IN_STREAM_RECOMMENDATION } from 'calypso/reader/follow-sources';
import CombinedCard from 'calypso/blocks/reader-combined-card';
import EmptySearchRecommendedPost from './empty-search-recommended-post';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import compareProps from 'calypso/lib/compare-props';

class PostLifecycle extends React.Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		isDiscoverStream: PropTypes.bool,
		handleClick: PropTypes.func,
		recStreamKey: PropTypes.string,
	};

	render() {
		const { post, postKey, followSource, isSelected, recsStreamKey, streamKey } = this.props;

		if ( postKey.isRecommendationBlock ) {
			return (
				<RecommendedPosts
					recommendations={ postKey.recommendations }
					index={ postKey.index }
					streamKey={ recsStreamKey }
					followSource={ IN_STREAM_RECOMMENDATION }
				/>
			);
		} else if ( postKey.isCombination ) {
			return (
				<CombinedCard
					postKey={ postKey }
					index={ this.props.index }
					onClick={ this.props.handleClick }
					selectedPostKey={ this.props.selectedPostKey }
					followSource={ followSource }
					showFollowButton={ this.props.showPrimaryFollowButtonOnCards }
					blockedSites={ this.props.blockedSites }
				/>
			);
		} else if ( streamKey.indexOf( 'rec' ) > -1 ) {
			return <EmptySearchRecommendedPost post={ post } site={ postKey } />;
		} else if ( postKey.isGap ) {
			return (
				<ListGap
					gap={ postKey }
					selected={ isSelected }
					handleClick={ this.props.handleClick }
					streamKey={ streamKey }
				/>
			);
		} else if ( ! post ) {
			return (
				<Fragment>
					<QueryReaderPost postKey={ postKey } />
					<PostPlaceholder />
				</Fragment>
			);
		} else if ( post._state === 'error' ) {
			return <PostUnavailable post={ post } />;
		} else if (
			( ! post.is_external || post.is_jetpack ) &&
			includes( this.props.blockedSites, +post.site_ID )
		) {
			return <PostBlocked post={ post } />;
		} else if ( isXPost( post ) ) {
			const xMetadata = XPostHelper.getXPostMetadata( post );
			return (
				<CrossPost
					{ ...omit( this.props, 'store' ) }
					xMetadata={ xMetadata }
					post={ post }
					postKey={ postKey }
				/>
			);
		}

		return <Post { ...this.props } />;
	}
}

export default connect(
	( state, ownProps ) => ( {
		post: getPostByKey( state, ownProps.postKey ),
	} ),
	null,
	null,
	{
		forwardRef: true,
		areOwnPropsEqual: compareProps( { ignore: [ 'handleClick' ] } ),
	}
)( PostLifecycle );
