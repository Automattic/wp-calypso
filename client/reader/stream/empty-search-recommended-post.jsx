import { useDispatch } from 'react-redux';
import { recordTrackForPost, recordAction } from 'calypso/reader/stats';
import { showSelectedPost } from 'calypso/reader/utils';
import Post from './post';

export default function EmptySearchRecommendedPost( {
	post,
	postKey,
	streamKey,
	fixedHeaderHeight,
} ) {
	const dispatch = useDispatch();

	function handlePostClick() {
		recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_post_click' );
		dispatch(
			showSelectedPost( {
				postKey: postKey,
				streamKey,
			} )
		);
	}
	if ( ! post ) {
		return null;
	}

	return (
		<Post
			post={ post }
			handleClick={ handlePostClick }
			fixedHeaderHeight={ fixedHeaderHeight }
			streamKey={ streamKey }
		/>
	);
}
