/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';
import { flowRight } from 'lodash';
import Gridicon from 'components/gridicon';

/**
 * Internal dependencies
 */
import titlecase from 'to-title-case';
import { Button } from '@automattic/components';
import { getSiteStatsCSVData, isRequestingSiteStatsForQuery } from 'state/stats/lists/selectors';
import { recordGoogleEvent } from 'state/analytics/actions';
import QuerySiteStats from 'components/data/query-site-stats';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getSiteSlug } from 'state/sites/selectors';

class StatsDownloadCsv extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		path: PropTypes.string.isRequired,
		period: PropTypes.object.isRequired,
		dataList: PropTypes.object,
		data: PropTypes.array,
		query: PropTypes.object,
		statType: PropTypes.string,
		siteId: PropTypes.number,
		borderless: PropTypes.bool,
	};

	downloadCsv = ( event ) => {
		event.preventDefault();
		const { siteSlug, path, period, data } = this.props;

		const fileName =
			[
				siteSlug,
				path,
				period.period,
				period.startOf.format( 'L' ),
				period.endOf.format( 'L' ),
			].join( '_' ) + '.csv';

		this.props.recordGoogleEvent( 'Stats', 'CSV Download ' + titlecase( path ) );

		const csvData = data
			.map( ( row ) => {
				return row.join( ',' );
			} )
			.join( '\n' );

		const blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

		saveAs( blob, fileName );
	};

	render() {
		const { data, siteId, statType, query, translate, isLoading, borderless } = this.props;
		try {
			new Blob(); // eslint-disable-line no-new
		} catch ( e ) {
			return null;
		}
		const disabled = isLoading || ! data.length;

		return (
			<Button
				className="stats-download-csv"
				compact
				onClick={ this.downloadCsv }
				disabled={ disabled }
				borderless={ borderless }
			>
				{ siteId && statType && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }
				<Gridicon icon="cloud-download" />{ ' ' }
				{ translate( 'Download data as CSV', {
					context: 'Action shown in stats to download data as csv.',
				} ) }
			</Button>
		);
	}
}

const connectComponent = connect(
	( state, ownProps ) => {
		const { dataList, statType, query } = ownProps;
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		let data;
		let isLoading;

		// TODO: When `stats-list` is no longer, this can be removed
		if ( dataList ) {
			data = dataList.csvData();
			isLoading = dataList.isLoading();
		} else {
			data = getSiteStatsCSVData( state, siteId, statType, query );
			isLoading = isRequestingSiteStatsForQuery( state, siteId, statType, query );
		}

		return { data, siteSlug, siteId, isLoading };
	},
	{ recordGoogleEvent },
	null,
	{ pure: false }
);

export default flowRight( connectComponent, localize )( StatsDownloadCsv );
