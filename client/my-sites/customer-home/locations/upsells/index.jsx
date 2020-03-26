/**
 * External dependencies
 */
import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import isSiteChecklistComplete from 'state/selectors/is-site-checklist-complete';
import isUnlaunchedSite from 'state/selectors/is-unlaunched-site';
import { getSiteOption } from 'state/sites/selectors';
import StatsBanners from 'my-sites/stats/stats-banners';
import { getSelectedSiteId, getSelectedSiteSlug } from 'state/ui/selectors';

/**
 * Style dependencies
 */
import './style.scss';

const Upsells = ( {
	isChecklistComplete,
	isEstablishedSite,
	siteId,
	siteIsUnlaunched,
	siteSlug,
} ) => {
	return (
		<div className="upsells">
			{ // Only show upgrade nudges to sites > 2 days old
			isEstablishedSite && (
				<StatsBanners
					siteId={ siteId }
					slug={ siteSlug }
					primaryButton={ isChecklistComplete && ! siteIsUnlaunched }
				/>
			) }
		</div>
	);
};

const mapStateToProps = state => {
	const siteId = getSelectedSiteId( state );
	const createdAt = getSiteOption( state, siteId, 'created_at' );

	return {
		isChecklistComplete: isSiteChecklistComplete( state, siteId ),
		isEstablishedSite: moment().isAfter( moment( createdAt ).add( 2, 'days' ) ),
		siteId,
		siteIsUnlaunched: isUnlaunchedSite( state, siteId ),
		siteSlug: getSelectedSiteSlug( state ),
	};
};

export default connect( mapStateToProps )( Upsells );
