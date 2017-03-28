/**
 * External Dependencies
 */
import React, { PropTypes } from 'react';
import { map, partial, some } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal Dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import PostStore from 'lib/feed-post-store';
import {
	recordAction,
	recordTrackForPost,
} from 'reader/stats';
import Button from 'components/button';
import { dismissPost } from 'lib/feed-stream-store/actions';

function dismissRecommendation( uiIndex, storeId, post ) {
	recordTrackForPost(
		'calypso_reader_recommended_post_dismissed',
		post,
		{
			recommendation_source: 'in-stream',
			ui_position: uiIndex
		}
	);
	recordAction( 'in_stream_rec_dismiss' );
	dismissPost( storeId, post );
}

function handleSiteClick( uiIndex, post ) {
	recordTrackForPost(
		'calypso_reader_recommended_site_clicked',
		post,
		{
			recommendation_source: 'in-stream',
			ui_position: uiIndex
		}
	);
	recordAction( 'in_stream_rec_site_click' );
}

function handlePostClick( uiIndex, post ) {
	recordTrackForPost(
		'calypso_reader_recommended_post_clicked',
		post,
		{
			recommendation_source: 'in-stream',
			ui_position: uiIndex
		}
	);
	recordAction( 'in_stream_rec_post_click' );
}

export class RecommendedPosts extends React.PureComponent {
	state = {
		posts: map( this.props.recommendations, PostStore.get.bind( PostStore ) )
	}

	updatePosts = ( props = this.props ) => {
		const posts = map( props.recommendations, PostStore.get.bind( PostStore ) );
		if ( some( posts, ( post, i ) => post !== this.state.posts[ i ] ) ) {
			this.setState( { posts } );
		}
	}

	componentWillMount() {
		PostStore.on( 'change', this.updatePosts );
	}

	componentWillReceiveProps( nextProps ) {
		this.updatePosts( nextProps );
	}

	componentWillUnmount() {
		PostStore.off( 'change', this.updatePosts );
	}

	render() {
		return (
			<div className="reader-stream__recommended-posts">
				<h1 className="reader-stream__recommended-posts-header">
					<Gridicon icon="thumbs-up" size={ 18 } />&nbsp;{ this.props.translate( 'Recommended Posts' ) }
				</h1>
				<ul className="reader-stream__recommended-posts-list">
					{
						map(
							this.state.posts,
							( post, index ) => {
								const uiIndex = this.props.index + index;
								return ( <li className="reader-stream__recommended-posts-list-item" key={ post.global_ID }>
									<div className="reader-stream__recommended-post-dismiss">
										<Button borderless
										title={ this.props.translate( 'Dismiss this recommendation' ) }
										onClick={ partial( dismissRecommendation, uiIndex, this.props.storeId, post ) }>
										<Gridicon icon="cross" size={ 14 } />
										</Button>
									</div>
									<RelatedPostCard
										post={ post }
										onPostClick={ partial( handlePostClick, uiIndex ) }
										onSiteClick={ partial( handleSiteClick, uiIndex ) }
										followSource={ this.props.followSource } />
								</li> );
							}
						)
					}
				</ul>
			</div>
		);
	}
}

RecommendedPosts.propTypes = {
	index: PropTypes.number,
	translate: PropTypes.func,
	recommendations: PropTypes.array,
};

export default localize( RecommendedPosts );
