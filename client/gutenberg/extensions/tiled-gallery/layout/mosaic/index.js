/**
 * Internal dependencies
 */
import Row from '../row';
import Column from '../column';
import { imagesToRatios, ratiosToRows } from './ratios';

export default function Mosaic( { images, isWide, renderedImages } ) {
	const ratios = imagesToRatios( images );
	const rows = ratiosToRows( ratios, { isWide } );

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
