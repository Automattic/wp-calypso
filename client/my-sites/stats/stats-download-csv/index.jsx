/**
 * External dependencies
 */
import React, { PropTypes } from 'react';
import { saveAs } from 'browser-filesaver';

/**
 * Internal dependencies
 */
import titlecase from 'to-title-case';
import analytics from 'analytics';
import Gridicon from 'components/gridicon';
import { csvData } from 'state/stats/utils';

module.exports = React.createClass( {
	displayName: 'StatsDownloadCsv',

	propTypes: {
		site: PropTypes.object.isRequired,
		path: PropTypes.string.isRequired,
		period: PropTypes.object.isRequired,
		response: PropTypes.object.isRequired
	},

	downloadCsv( event ) {
		event.preventDefault();
		const { response, site, path, period } = this.props;
		const data = csvData( response );
		const fileName = [
			site.slug,
			path,
			period.period,
			period.startOf.format( 'L' ),
			period.endOf.format( 'L' )
		].join( '_' ) + '.csv';

		analytics.ga.recordEvent( 'Stats', 'CSV Download ' + titlecase( path ) );

		const _csvData = data.map( ( row ) => {
			return row.join( ',' );
		} ).join( '\n' );

		const blob = new Blob( [ _csvData ], { type: 'text/csv;charset=utf-8' } );

		saveAs( blob, fileName );
	},

	render() {
		try {
			const isFileSaverSupported = !! new Blob();
		} catch ( e ) {
			return null;
		}

		return (
			<div className="module-content-text">
				<a href="#" onClick={ this.downloadCsv }>
					<Gridicon icon="cloud-download" />
					<span className="label">{ this.translate( 'Download data as CSV', { context: 'Action shown in stats to download data as csv.' } ) }
					</span>
				</a>
			</div>
		);
	}
} );
