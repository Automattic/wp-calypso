import { Button, Gridicon } from '@automattic/components';
import { saveAs } from 'browser-filesaver';
import { useTranslate } from 'i18n-calypso';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';

function UTMExportButton( { data, fileName } ) {
	// Button set up.
	const translate = useTranslate();
	const buttonLabel = translate( 'Download data as CSV' );
	const shouldDisableExport = data && data.length !== 0 ? false : true;

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

	// Turns the flat array into a CSV string.
	// Processes the label before export.
	const prepareDataForDownload = ( flatData ) => {
		const csvData = flatData
			.map( ( row ) => {
				// Label should include parent context if present.
				// ie: "parent label > child label" -- including surrounding quotes.
				let label = row?.context ? `${ row.context } > ${ row.label }` : row.label;
				label = label.replace( /"/g, '""' );
				// Return the label and value.
				return `"${ label }",${ row.value }`;
			} )
			.join( '\n' );

		return csvData;
	};

	const initiateDownload = ( event ) => {
		event.preventDefault();
		recordGoogleEvent( 'Stats', 'CSV Download UTM' );

		const flattenedData = flattenDataForExport( data );
		const csvData = prepareDataForDownload( flattenedData );
		const blob = new Blob( [ csvData ], { type: 'text/csv;charset=utf-8' } );

		saveAs( blob, fileName );
	};

	return (
		<Button
			className="stats-download-csv"
			compact
			onClick={ initiateDownload }
			disabled={ shouldDisableExport }
			borderless
		>
			<Gridicon icon="cloud-download" /> { buttonLabel }
		</Button>
	);
}

export default UTMExportButton;
