import { Button } from '@wordpress/components';
import { download } from '@wordpress/icons';
import { saveAs } from 'browser-filesaver';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import titlecase from 'to-title-case';
import QuerySiteStats from 'calypso/components/data/query-site-stats';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import {
	getSiteStatsCSVData,
	isRequestingSiteStatsForQuery,
} from 'calypso/state/stats/lists/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

class StatsDownloadCsv extends Component {
	static propTypes = {
		siteSlug: PropTypes.string,
		path: PropTypes.string.isRequired,
		period: PropTypes.object.isRequired,
		data: PropTypes.array,
		query: PropTypes.object,
		statType: PropTypes.string,
		siteId: PropTypes.number,
		borderless: PropTypes.bool,
	};

	processExportData = ( data ) => {
		const { statType } = this.props;
		if ( statType !== 'statsReferrers' ) {
			return data;
		}
		// Work-around for a bug in the referrers data.
		// Can include unexpected elements in the data array.
		// Results in "[object Object]" in the CSV output.
		// To avoid this, we only include the first two elements of each row.
		return data.map( ( row ) => {
			if ( Array.isArray( row ) ) {
				return row.slice( 0, 2 );
			}
			return row;
		} );
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
			].join( '-' ) + '.csv';

		this.props.recordGoogleEvent( 'Stats', 'CSV Download ' + titlecase( path ) );

		const csvData = this.processExportData( data )
			.map( ( row ) => {
				if ( Array.isArray( row ) ) {
					return row.join( ',' );
				}

				return Object.values( row )
					.map( ( value ) => `"${ value.toString().replace( /"/g, '""' ) }"` )
					.join( ',' );
			} )
			.join( '\n' );

		const blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

		saveAs( blob, fileName );
	};

	render() {
		const { data, siteId, statType, query, translate, isLoading, borderless, skipQuery } =
			this.props;
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
				icon={ download }
			>
				{ ! skipQuery && siteId && statType && query && (
					<QuerySiteStats statType={ statType } siteId={ siteId } query={ query } />
				) }
				{ translate( 'Download CSV', {
					context: 'Action shown in stats to download data as csv.',
				} ) }
			</Button>
		);
	}
}

const connectComponent = connect(
	( state, ownProps ) => {
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );

		if ( ownProps.data ) {
			return { data: ownProps.data, siteSlug, siteId, isLoading: false };
		}

		const { statType, query } = ownProps;
		const data = getSiteStatsCSVData( state, siteId, statType, query );
		const isLoading = isRequestingSiteStatsForQuery( state, siteId, statType, query );

		return { data, siteSlug, siteId, isLoading };
	},
	{ recordGoogleEvent }
);

export default connectComponent( localize( StatsDownloadCsv ) );
