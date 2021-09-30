import { Button, Gridicon } from '@automattic/components';
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
		const { statType, query } = ownProps;
		const siteId = getSelectedSiteId( state );
		const siteSlug = getSiteSlug( state, siteId );
		const data = getSiteStatsCSVData( state, siteId, statType, query );
		const isLoading = isRequestingSiteStatsForQuery( state, siteId, statType, query );

		return { data, siteSlug, siteId, isLoading };
	},
	{ recordGoogleEvent }
);

export default connectComponent( localize( StatsDownloadCsv ) );
