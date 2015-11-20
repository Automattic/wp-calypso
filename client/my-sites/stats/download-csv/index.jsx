/**
 * External dependencies
 */
var React = require( 'react' ),
	fileSaver = require( 'browser-filesaver' ).saveAs;

/**
 * Internal dependencies
 */
var titlecase = require( 'to-title-case' ),
	analytics = require( 'analytics' ),
	Gridicon = require( 'components/gridicon' );

module.exports = React.createClass( {
	displayName: 'StatsCsvExport',

	propTypes: {
		site: React.PropTypes.object.isRequired,
		path: React.PropTypes.string.isRequired,
		period: React.PropTypes.object.isRequired,
		dataList: React.PropTypes.object.isRequired
	},

	downloadCsv: function( event ) {
		var csvData,
			fileName,
			data = this.props.dataList.csvData(),
			blob;

		fileName = [
			this.props.site.slug,
			this.props.path,
			this.props.period.period,
			this.props.period.startOf.format( 'L' ),
			this.props.period.endOf.format( 'L' )
		].join( '_' ) + '.csv';

		event.preventDefault();

		analytics.ga.recordEvent( 'Stats', 'CSV Download ' + titlecase( this.props.path ) );

		csvData = data.map( function( row ) { return row.join( ',' ); } ).join( "\n" );

		blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

		fileSaver( blob, fileName );
	},
	
	render: function() {
		var downloadLabel,
			isFileSaverSupported,
			downloadLink;

		try {
			isFileSaverSupported = !! new Blob();
		} catch( e ) {

		}

		if ( isFileSaverSupported ) {
			downloadLabel = this.translate( 'Download data as CSV', { 'context': 'Action shown in stats to download data as csv.' } );

			downloadLink = (
				<div className="module-content-text">
					<ul className="documentation">
						<li>
							<a href='#' onClick={ this.downloadCsv }>
								{ downloadLabel }
								<Gridicon icon="cloud-download" />
							</a>
						</li>
					</ul>
				</div>
			);
		}
		return downloadLink;
	}
} );