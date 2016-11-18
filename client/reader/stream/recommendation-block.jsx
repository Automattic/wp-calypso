/**
 * External Dependencies
 */
import React from 'react';
import { map, some } from 'lodash';

/**
 * Internal Dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import PostStore from 'lib/feed-post-store';
import Gridicon from 'components/gridicon';

export default class RecommendationBlock extends React.PureComponent {
	state = {
		posts: map( this.props.recommendations, PostStore.get.bind( PostStore ) )
	}

	updatePosts = ( props = this.props ) => {
		const posts = map( props.recommendations, PostStore.get.bind( PostStore ) );
		if ( some( posts, ( post, i ) => post !== this.state.posts[ i ] ) ) {
			this.setState( posts );
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
			<div className="reader-stream__recommendation-block">
				<h5 className="reader-stream__recommendation-block-header"><Gridicon icon="star" /> Recommended Posts</h5>
				<div className="reader-stream__recommendation-block-posts">
					{ map( this.state.posts, post => <RelatedPostCard key={ post.global_ID } post={ post } /> ) }
				</div>
			</div>
		);
	}
}
