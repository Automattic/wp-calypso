/** @format */

/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'gridicons';

/**
 * Internal dependencies
 */
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';
import { getTerm } from 'state/terms/selectors';

function PodcastingPublishNotice( { translate, podcastingCategoryName, newPostUrl } ) {
	return (
		<div className="podcasting-details__publish-notice">
			<Gridicon icon="microphone" size={ 24 } />
			<span className="podcasting-details__publish-notice-text">
				{ translate(
					'{{newPostLink}}Publish a post{{/newPostLink}} in the {{strong}}%s{{/strong}} category to add a new episode.',
					{
						args: podcastingCategoryName,
						components: {
							strong: <strong />,
							newPostLink: <a href={ newPostUrl } />,
						},
					}
				) }
			</span>
		</div>
	);
}

export default connect( ( state, ownProps ) => {
	if ( ownProps.podcastingCategoryId <= 0 ) {
		return null;
	}

	const siteId = getSelectedSiteId( state );
	const siteSlug = getSelectedSiteSlug( state );

	const podcastingCategory = getTerm( state, siteId, 'category', ownProps.podcastingCategoryId );

	const newPostUrl = `/post/${ siteSlug }`;

	return {
		podcastingCategoryName: podcastingCategory && podcastingCategory.name,
		newPostUrl,
	};
} )( localize( PodcastingPublishNotice ) );
