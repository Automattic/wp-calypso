/**
 * External Dependencies
 */
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { map, partial } from 'lodash';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal Dependencies
 */
import { RelatedPostCard } from 'calypso/blocks/reader-related-card';
import { recordAction, recordTrackForPost } from 'calypso/reader/stats';
import { Button } from '@automattic/components';
import { dismissPost } from 'calypso/state/reader/site-dismissals/actions';
import { keyForPost } from 'calypso/reader/post-key';
import QueryReaderPost from 'calypso/components/data/query-reader-post';
import { getPostsByKeys } from 'calypso/state/reader/posts/selectors';

function dismissPostAnalytics( uiIndex, storeId, post ) {
	recordTrackForPost( 'calypso_reader_recommended_post_dismissed', post, {
		recommendation_source: 'in-stream',
		ui_position: uiIndex,
	} );
	recordAction( 'in_stream_rec_dismiss' );
}

function handleSiteClick( uiIndex, post ) {
	recordTrackForPost( 'calypso_reader_recommended_site_clicked', post, {
		recommendation_source: 'in-stream',
		ui_position: uiIndex,
	} );
	recordAction( 'in_stream_rec_site_click' );
}

function handlePostClick( uiIndex, post ) {
	recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
		recommendation_source: 'in-stream',
		ui_position: uiIndex,
	} );
	recordAction( 'in_stream_rec_post_click' );
}

export class RecommendedPosts extends React.PureComponent {
	static propTypes = {
		index: PropTypes.number,
		translate: PropTypes.func,
		recommendations: PropTypes.array,
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace, wpcalypso/jsx-gridicon-size */
	render() {
		const { posts, recommendations } = this.props;

		return (
			<div className="reader-stream__recommended-posts">
				<QueryReaderPost postKey={ recommendations[ 0 ] } />
				<QueryReaderPost postKey={ recommendations[ 1 ] } />
				<h1 className="reader-stream__recommended-posts-header">
					<Gridicon icon="thumbs-up" size={ 18 } />
					&nbsp;
					{ this.props.translate( 'Recommended Posts' ) }
				</h1>
				<ul className="reader-stream__recommended-posts-list">
					{ map( posts, ( post, index ) => {
						const uiIndex = this.props.index + index;
						return (
							<li
								className="reader-stream__recommended-posts-list-item"
								key={ `${ index }-${ post && post.global_ID }` }
							>
								<div className="reader-stream__recommended-post-dismiss">
									<Button
										borderless
										title={ this.props.translate( 'Dismiss this recommendation' ) }
										onClick={ () => {
											dismissPostAnalytics( uiIndex, this.props.streamKey, post );
											this.props.dismissPost( {
												streamKey: this.props.streamKey,
												postKey: keyForPost( post ),
											} );
										} }
									>
										<Gridicon icon="cross" size={ 14 } />
									</Button>
								</div>
								<RelatedPostCard
									post={ post }
									onPostClick={ partial( handlePostClick, uiIndex ) }
									onSiteClick={ partial( handleSiteClick, uiIndex ) }
									followSource={ this.props.followSource }
								/>
							</li>
						);
					} ) }
				</ul>
			</div>
		);
		/* eslint-enable wpcalypso/jsx-classname-namespace, wpcalypso/jsx-gridicon-size */
	}
}

export default connect(
	( state, ownProps ) => ( {
		posts: getPostsByKeys( state, ownProps.recommendations ),
	} ),
	{ dismissPost }
)( localize( RecommendedPosts ) );
