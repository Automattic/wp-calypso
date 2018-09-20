/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { get, mapValues, sortBy } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import QuerySiteStats from 'components/data/query-site-stats';
import { isJetpackSite, getSiteOption } from 'state/sites/selectors';
import { getSiteStatsNormalizedData } from 'state/stats/lists/selectors';

const StatsSparkline = ( { isJetpack, siteUrl, className, siteId, highestViews, translate } ) => {
	if ( ! siteId || ! siteUrl || isJetpack ) {
		return null;
	}

	const title = highestViews
		? translate( 'Highest hourly views %(highestViews)s', {
				args: { highestViews },
		  } )
		: null;

	return (
		<span>
			{ siteId && <QuerySiteStats siteId={ siteId } statType="statsInsights" /> }
			<img
				className={ className }
				title={ title }
				src={ `${ siteUrl }/wp-includes/charts/admin-bar-hours-scale-2x.php?masterbar=1&s=${ siteId }` }
			/>
		</span>
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
} )( localize( StatsSparkline ) );
