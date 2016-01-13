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
		const data = this.props.dataList.csvData();

		const fileName = [
			this.props.site.slug,
			this.props.path,
			this.props.period.period,
			this.props.period.startOf.format( 'L' ),
			this.props.period.endOf.format( 'L' )
		].join( '_' ) + '.csv';

		analytics.ga.recordEvent( 'Stats', 'CSV Download ' + titlecase( this.props.path ) );

		const csvData = data.map( ( row ) => {
			return row.join( ',' );
		} ).join( "\n" );

		const blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

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
				<ul className="documentation">
					<li>
						<a href="#" onClick={ this.downloadCsv }>
							{ this.translate( 'Download data as CSV', { context: 'Action shown in stats to download data as csv.' } ) }
							<Gridicon icon="cloud-download" />
						</a>
					</li>
				</ul>
			</div>
		);
	}
} );
