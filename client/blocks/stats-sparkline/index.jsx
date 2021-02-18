/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { get, mapValues, sortBy } from 'lodash';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { isJetpackSite, getSiteOption } from 'calypso/state/sites/selectors';
import { getSiteStatsNormalizedData } from 'calypso/state/stats/lists/selectors';

const StatsSparkline = ( { isJetpack, siteUrl, className, siteId, highestViews } ) => {
	const translate = useTranslate();

	if ( ! siteId || ! siteUrl || isJetpack ) {
		return null;
	}

	const title = highestViews
		? translate( 'Highest hourly views %(highestViews)s', { args: { highestViews } } )
		: null;

	const src = `${ siteUrl }/wp-includes/charts/admin-bar-hours-scale-2x.php?masterbar=1&s=${ siteId }`;

	return (
		<Fragment>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsInsights" /> }
			<img className={ className } alt={ title } title={ title } src={ src } />
		</Fragment>
	);
};

StatsSparkline.propTypes = {
	className: PropTypes.string,
	siteId: PropTypes.number,
	isJetpack: PropTypes.bool,
	siteUrl: PropTypes.string,
};

export default connect( ( state, ownProps ) => {
	const { siteId } = ownProps;
	const hourlyData = get(
		getSiteStatsNormalizedData( state, siteId, 'statsInsights' ),
		'hourlyViews',
		[]
	);
	const hourlyViews = sortBy( mapValues( hourlyData ) );
	return {
		isJetpack: isJetpackSite( state, siteId ),
		siteUrl: getSiteOption( state, siteId, 'unmapped_url' ),
		highestViews: hourlyViews.length ? hourlyViews[ hourlyViews.length - 1 ] : 0,
	};
} )( StatsSparkline );
