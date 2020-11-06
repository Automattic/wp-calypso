/**
 * External dependencies
 */
import React from 'react';
import { useSelector } from 'react-redux';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';
import ActivityCardList from 'calypso/components/activity-card-list';

const SearchResults = () => {
	const translate = useTranslate();

	const siteSlug = useSelector( getSelectedSiteSlug );
	const rewindableEvents = []; // TODO

	return (
		<div className="backup__search">
			<div className="backup__search-header">{ translate( 'Find a backup or restore point' ) }</div>
			<div className="backup__search-description">
				{ translate(
					'This is the complete event history for your site. Filter by date range and/ or activity type.'
				) }
			</div>
			<ActivityCardList logs={ rewindableEvents } pageSize={ 10 } siteSlug={ siteSlug } />
		</div>
	);
};

export default SearchResults;
