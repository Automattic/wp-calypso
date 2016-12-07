/**
 * External Dependencies
 */
import React from 'react';
import { map, some } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { RelatedPostCard } from 'blocks/reader-related-card-v2';
import PostStore from 'lib/feed-post-store';
import Gridicon from 'components/gridicon';
import * as stats from 'reader/stats';

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

	handlePostClick = ( post ) => {
		stats.recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
			recommendation_source: 'in-stream',
		} );
		stats.recordAction( 'in_stream_rec_post_click' );
	}

	handleSiteClick = ( post ) => {
		stats.recordTrackForPost( 'calypso_reader_recommended_site_clicked', post, {
			recommendation_source: 'in-stream',
		} );
		stats.recordAction( 'in_stream_rec_site_click' );
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
					<Gridicon icon="thumbs-up" size={ 18 }/>&nbsp;{ this.props.translate( 'Recommended Posts' ) }
				</h1>
				<ul className="reader-stream__recommended-posts-list">
					{
						map(
							this.state.posts,
							post => <li className="reader-stream__recommended-posts-list-item" key={ post.global_ID }><RelatedPostCard post={ post } onPostClick={ this.handlePostClick } onSiteClick={ this.handleSiteClick } /></li>
						)
					}
				</ul>
			</div>
		);
	}
}

export default localize( RecommendedPosts );
