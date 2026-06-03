import { Button, Gridicon } from '@automattic/components';
import { useQueryClient } from '@tanstack/react-query';
import { localize } from 'i18n-calypso';
import { map } from 'lodash';
import PropTypes from 'prop-types';
import { PureComponent } from 'react';
import { useDispatch } from 'react-redux';
import { RelatedPostCard } from 'calypso/blocks/reader-related-card';
import { usePost } from 'calypso/reader/data/post';
import { useDismissRecommendedSite } from 'calypso/reader/data/recommended-sites';
import { removeStreamItemFromCache } from 'calypso/reader/data/stream';
import { keyForPost, keyToString } from 'calypso/reader/post-key';
import { recordAction, recordTrackForPost } from 'calypso/reader/stats';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

function dismissRecommendedPostAnalytics( uiIndex, storeId, post ) {
	recordTrackForPost( 'calypso_reader_recommended_post_dismissed', post, {
		recommendation_source: 'in-stream',
		ui_position: uiIndex,
	} );
	recordAction( 'in_stream_rec_dismiss' );
}

const handleSiteClick = ( uiIndex ) => ( post ) => {
	recordTrackForPost( 'calypso_reader_recommended_site_clicked', post, {
		recommendation_source: 'in-stream',
		ui_position: uiIndex,
	} );
	recordAction( 'in_stream_rec_site_click' );
};

const handlePostClick = ( uiIndex ) => ( post ) => {
	recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
		recommendation_source: 'in-stream',
		ui_position: uiIndex,
	} );
	recordAction( 'in_stream_rec_post_click' );
};

export class RecommendedPosts extends PureComponent {
	static propTypes = {
		index: PropTypes.number,
		translate: PropTypes.func,
		recommendations: PropTypes.array,
		onDismissPost: PropTypes.func,
	};

	/* eslint-disable wpcalypso/jsx-classname-namespace, wpcalypso/jsx-gridicon-size */
	render() {
		const { posts } = this.props;

		return (
			<div className="reader-stream__recommended-posts">
				<h1 className="reader-stream__recommended-posts-header">
					<Gridicon icon="thumbs-up" size={ 18 } />
					&nbsp;
					{ this.props.translate( 'Recommended Posts' ) }
				</h1>
				<ul className="reader-stream__recommended-posts-list">
					{ map( posts, ( post, index ) => {
						const uiIndex = this.props.index + index;
						const recommendationKey = this.props.recommendations?.[ index ];
						return (
							<li
								className="reader-stream__recommended-posts-list-item"
								key={
									keyToString( recommendationKey ) ?? `${ index }-${ post?.global_ID ?? 'pending' }`
								}
							>
								{ post && (
									<div className="reader-stream__recommended-post-dismiss">
										<Button
											borderless
											title={ this.props.translate( 'Dismiss this recommendation' ) }
											onClick={ () => {
												const postKey = keyForPost( post );
												dismissRecommendedPostAnalytics( uiIndex, this.props.streamKey, post );
												this.props.onDismissPost?.( postKey );
											} }
										>
											<Gridicon icon="cross" size={ 14 } />
										</Button>
									</div>
								) }
								<RelatedPostCard
									post={ post }
									onPostClick={ handlePostClick( uiIndex ) }
									onSiteClick={ handleSiteClick( uiIndex ) }
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

const RecommendedPostsWithPosts = ( props ) => {
	const { recommendations = [] } = props;
	const dispatch = useDispatch();
	const queryClient = useQueryClient();
	const dismissRecommendedSite = useDismissRecommendedSite();
	const { data: firstPost } = usePost( recommendations[ 0 ] );
	const { data: secondPost } = usePost( recommendations[ 1 ] );
	const posts = recommendations.slice( 0, 2 ).map( ( _recommendation, index ) => {
		return index === 0 ? firstPost ?? null : secondPost ?? null;
	} );
	const onDismissPost = ( postKey ) => {
		if ( ! postKey?.blogId ) {
			return;
		}

		dismissRecommendedSite.mutate(
			{ siteId: postKey.blogId },
			{
				onSuccess: () => {
					removeStreamItemFromCache( queryClient, {
						streamKey: props.streamKey,
						item: postKey,
					} );
					dispatch(
						successNotice( props.translate( "We won't recommend this site to you again." ), {
							duration: 5000,
						} )
					);
				},
				onError: () => {
					dispatch(
						errorNotice( props.translate( 'Sorry, there was a problem dismissing that site.' ) )
					);
				},
			}
		);
	};

	return <RecommendedPosts { ...props } posts={ posts } onDismissPost={ onDismissPost } />;
};

export default localize( RecommendedPostsWithPosts );
