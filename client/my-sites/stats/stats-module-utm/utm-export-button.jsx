import { Button, Gridicon } from '@automattic/components';
import { saveAs } from 'browser-filesaver';
import { useTranslate } from 'i18n-calypso';

function UTMExportButton( { data } ) {
	// Button set up.
	const translate = useTranslate();
	const buttonLabel = translate( 'Download data as CSV' );
	const shouldDisableExport = data && data.length !== 0 ? false : true;
	const shouldDrawBorder = true;

	// Turns the working data into a flattened array of objects.
	// Preserves the original data but updates the label for export.
	const flattenDataForExport = ( originalData ) => {
		const newData = [];
		// Map the array of objects.
		originalData.forEach( ( row ) => {
			// Wrap label in quotes and push values.
			let newLabel = `"${ row.label }"`;
			newData.push( { label: newLabel, value: row.value } );
			// Flatten children if present.
			const children = row?.children;
			if ( children ) {
				const newChildren = children.map( ( child ) => {
					newLabel = `"${ row.label } > ${ child.label }"`;
					return { ...child, label: newLabel };
				} );
				newData.push( ...newChildren );
			}
		} );
		return newData;
	};

	// Turns the flat array into a CSV string.
	const prepareDataForDownload = ( flatData ) => {
		const csvData = flatData
			.map( ( row ) => {
				return `${ row.label },${ row.value }`;
			} )
			.join( '\n' );

		return csvData;
	};

	const initiateDownload = ( event ) => {
		event.preventDefault();

		// TODO: Provide a better default file name.
		const fileName = 'my-data.csv';
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
			borderless={ shouldDrawBorder }
		>
			<Gridicon icon="cloud-download" /> { buttonLabel }
		</Button>
	);
}

export default UTMExportButton;
