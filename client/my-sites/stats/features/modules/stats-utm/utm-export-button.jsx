import { STATS_FEATURE_UTM_STATS } from 'calypso/my-sites/stats/constants';
import DownloadCsv from 'calypso/my-sites/stats/stats-download-csv';

function UTMExportButton( { data, path, period } ) {
	// Flatten the data into a shallow array.
	// Children gain a "context" property to indicate their parent label.
	const flattenDataForExport = ( originalData ) => {
		const newData = [];
		originalData.forEach( ( row ) => {
			newData.push( row );
			const children = row?.children;
			if ( children ) {
				const newChildren = children.map( ( child ) => {
					return { ...child, context: row.label };
				} );
				newData.push( ...newChildren );
			}
		} );
		return newData;
	};

	// Flattens hierarchical UTM data into a simple array for CSV export.
	// Child items include their parent's label as context.
	const prepareDataForDownload = ( flatData ) => {
		return flatData.map( ( row ) => {
			// Label should include parent context if present.
			// ie: "parent label > child label" -- including surrounding quotes.
			let label = row?.context ? `${ row.context } > ${ row.label }` : row.label;
			label = label.replace( /"/g, '""' ); // Escape double quotes
			return [ `"${ label }"`, `${ row.value }` ];
		} );
	};

	const flattenedData = flattenDataForExport( data );
	const csvData = prepareDataForDownload( flattenedData );

	return (
		<DownloadCsv
			data={ csvData }
			path={ path }
			period={ period }
			skipQuery
			statType={ STATS_FEATURE_UTM_STATS }
		/>
	);
}

export default UTMExportButton;
