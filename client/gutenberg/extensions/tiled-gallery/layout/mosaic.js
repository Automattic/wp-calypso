/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import Row from './row';
import Column from './column';

export default function Mosaic( { images, renderedImages } ) {
	const ratios = images.map( ( { height, width } ) => ( height && width ? width / height : 1 ) );
	const rows = ratiosToShapes( ratios );

	let cursor = 0;
	return rows.map( ( row, rowIndex ) => (
		<Row key={ rowIndex }>
			{ row.map( ( colSize, colIndex ) => {
				const columnImages = renderedImages.slice( cursor, cursor + colSize );
				cursor += colSize;
				return <Column key={ colIndex }>{ columnImages }</Column>;
			} ) }
		</Row>
	) );
}

function ratiosToShapes( ratios ) {
	return [ Array( ratios.length ).fill( 1 ) ];
}
