/**
 * External dependencies
 */
import classNames from 'classnames';
import { localize } from 'i18n-calypso';
import React from 'react';
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import StatsList from '../stats-list';
import StatsListLegend from '../stats-list/legend';
import StatsModuleHeader from '../stats-module/header';
import StatsModulePlaceholder from '../stats-module/placeholder';
import Card from 'components/card';
import QuerySiteStats from 'components/data/query-site-stats';
import { isRequestingSiteStatsForQuery, getSiteStatsNormalizedData } from 'state/stats/lists/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';

const StatModuleVideoDetails = ( props ) => {
	const { data, query, requesting, siteId, translate } = props;
	const isLoading = requesting && ! data;

	const classes = classNames(
		'stats-module',
		'is-expanded',
		'summary',
		{
			'is-loading': isLoading,
			'has-no-data': ! data
		}
	);

	return (
		<Card className={ classes }>
			{ siteId && <QuerySiteStats statType="statsVideo" siteId={ siteId } query={ query } /> }
			<StatsModuleHeader title={ translate( 'Video Embeds' ) } showActions={ false } />
			<StatsListLegend label={ translate( 'Page' ) } />
			<StatsModulePlaceholder isLoading={ isLoading } />
			<StatsList
				moduleName="Video Details"
				data={ data ? data.pages : [] }
			/>
		</Card>
	);
};

export default connect( ( state, {  postId } ) => {
	const siteId = getSelectedSiteId( state );
	const query = { postId };

	return {
		requesting: isRequestingSiteStatsForQuery( state, siteId, 'statsVideo', query ),
		data: getSiteStatsNormalizedData( state, siteId, 'statsVideo', query ),
		query,
		siteId
	};
} )( localize( StatModuleVideoDetails ) );
