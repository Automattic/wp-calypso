/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { saveAs } from 'browser-filesaver';

/**
 * Internal dependencies
 */
import titlecase from 'to-title-case';
import analytics from 'lib/analytics';
import Gridicon from 'components/gridicon';
import Button from 'components/button';

module.exports = React.createClass( {
	displayName: 'StatsDownloadCsv',

	propTypes: {
		site: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		period: PropTypes.object.isRequired,
		dataList: PropTypes.object.isRequired
	},

	downloadCsv( event ) {
		event.preventDefault();
		const { dataList, site, path, period } = this.props;
		const data = dataList.csvData();

		const fileName = [
			site.slug,
			path,
			period.period,
			period.startOf.format( 'L' ),
			period.endOf.format( 'L' )
		].join( '_' ) + '.csv';

		analytics.ga.recordEvent( 'Stats', 'CSV Download ' + titlecase( path ) );

		const csvData = data.map( ( row ) => {
			return row.join( ',' );
		} ).join( '\n' );

		const blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

		saveAs( blob, fileName );
	},

	render() {
		try {
			const isFileSaverSupported = !! new Blob(); // eslint-disable-line no-unused-vars
		} catch ( e ) {
			return null;
		}

		return (
			<Button compact onClick={ this.downloadCsv }>
					<Gridicon icon="cloud-download" /> { this.translate( 'Download data as CSV', { context: 'Action shown in stats to download data as csv.' } ) }
			</Button>
		);
	}
} );
