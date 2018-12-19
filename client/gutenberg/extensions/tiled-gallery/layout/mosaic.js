/**
 * External dependencies
 */
import { repeat } from 'lodash';

/**
 * Internal dependencies
 */
import Row from './row';
import Column from './column';

export default function Mosaic( { images, renderedImages } ) {
	const ratios = images.map( ( { height, width } ) => ( height && width ? width / height : 1 ) );
	const rows = ratiosToShapes( ratios );

	let cursor = 0;

	return rows.map( ( columns, rowIndex ) => (
		<Row key={ rowIndex }>
			{ columns.map( ( imageCount, colIndex ) => {
				const column = renderedImages
					.slice( cursor, imageCount )
					.map( image => <Column key={ colIndex }>{ image }</Column> );
				cursor += imageCount;

				return column;
			} ) }
		</Row>
	) );
}

function ratiosToShapes( ratios ) {
	return [ repeat( 1, ratios.length ) ];
}
