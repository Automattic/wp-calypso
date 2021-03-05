/**
 * External dependencies
 */
import React from 'react';

/**
 * Internal dependencies
 */
import { RelatedPostCard } from 'calypso/blocks/reader-related-card';
import { recordTrackForPost, recordAction } from 'calypso/reader/stats';
import { EMPTY_SEARCH_RECOMMENDATIONS } from 'calypso/reader/follow-sources';

export default function EmptySearchRecommendedPost( { post } ) {
	function handlePostClick() {
		recordTrackForPost( 'calypso_reader_recommended_post_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_post_click' );
	}

	function handleSiteClick() {
		recordTrackForPost( 'calypso_reader_recommended_site_clicked', post, {
			recommendation_source: 'empty-search',
		} );
		recordAction( 'search_page_rec_site_click' );
	}

	const site = { title: post && post.site_name };

	/* eslint-disable  wpcalypso/jsx-classname-namespace */
	return (
		<div className="search-stream__recommendation-list-item" key={ post && post.global_ID }>
			<RelatedPostCard
				post={ post }
				site={ site }
				onSiteClick={ handleSiteClick }
				onPostClick={ handlePostClick }
				followSource={ EMPTY_SEARCH_RECOMMENDATIONS }
			/>
		</div>
	);
}
