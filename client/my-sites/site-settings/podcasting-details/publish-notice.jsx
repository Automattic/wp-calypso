/**
 * External dependencies
 */
import React from 'react';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import Gridicon from 'calypso/components/gridicon';

/**
 * Internal dependencies
 */
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { getTerm } from 'calypso/state/terms/selectors';

function PodcastingPublishNotice( { translate, podcastingCategoryName } ) {
	let podcastNoticeText;

	if ( podcastingCategoryName ) {
		podcastNoticeText = translate(
			'Publish blog posts in the {{strong}}%s{{/strong}} category to add new episodes.',
			{
				args: podcastingCategoryName,
				components: { strong: <strong /> },
			}
		);
	} else {
		podcastNoticeText = translate( 'Select a category to enable podcasting.' );
	}

	return (
		<div className="podcasting-details__publish-notice">
			<Gridicon icon="microphone" size={ 24 } />
			<span className="podcasting-details__publish-notice-text">{ podcastNoticeText }</span>
		</div>
	);
}

export default connect( ( state, ownProps ) => {
	if ( ownProps.podcastingCategoryId <= 0 ) {
		return null;
	}

	const siteId = getSelectedSiteId( state );
	const podcastingCategory = getTerm( state, siteId, 'category', ownProps.podcastingCategoryId );

	return {
		podcastingCategoryName: podcastingCategory && podcastingCategory.name,
	};
} )( localize( PodcastingPublishNotice ) );
