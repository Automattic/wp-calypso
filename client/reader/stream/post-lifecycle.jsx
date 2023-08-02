import { omit, includes } from 'lodash';
import PropTypes from 'prop-types';
import { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import PostBlocked from 'calypso/blocks/reader-post-card/blocked';
import BloggingPromptCard from 'calypso/components/blogging-prompt-card';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import compareProps from 'calypso/lib/compare-props';
import { IN_STREAM_RECOMMENDATION } from 'calypso/reader/follow-sources';
import ListGap from 'calypso/reader/list-gap';
import XPostHelper, { isXPost } from 'calypso/reader/xpost-helper';
import { getPostByKey } from 'calypso/state/reader/posts/selectors';
import EmptySearchRecommendedPost from './empty-search-recommended-post';
import Post from './post';
import PostPlaceholder from './post-placeholder';
import PostUnavailable from './post-unavailable';
import RecommendedPosts from './recommended-posts';
import CrossPost from './x-post';

class PostLifecycle extends Component {
	static propTypes = {
		postKey: PropTypes.object.isRequired,
		isDiscoverStream: PropTypes.bool,
		handleClick: PropTypes.func,
		recStreamKey: PropTypes.string,
	};

	render() {
		const { post, postKey, isSelected, recsStreamKey, streamKey, siteId, isDiscoverStream } =
			this.props;

		if ( postKey.isRecommendationBlock ) {
			return (
				<RecommendedPosts
					recommendations={ postKey.recommendations }
					index={ postKey.index }
					streamKey={ recsStreamKey }
					followSource={ IN_STREAM_RECOMMENDATION }
				/>
			);
		} else if ( postKey.isPromptBlock ) {
			return (
				<div
					className="reader-stream__blogging-prompt"
					key={ 'blogging-prompt-card-' + postKey.index }
				>
					<BloggingPromptCard
						siteId={ siteId }
						viewContext="reader"
						showMenu={ false }
						index={ postKey.index }
					/>
				</div>
			);
		} else if ( ! isDiscoverStream && streamKey.indexOf( 'rec' ) > -1 ) {
			return (
				<EmptySearchRecommendedPost post={ post } postKey={ postKey } streamKey={ streamKey } />
			);
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
		} else if ( post.is_error ) {
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
