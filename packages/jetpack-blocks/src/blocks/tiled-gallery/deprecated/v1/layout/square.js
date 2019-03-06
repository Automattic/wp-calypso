/**
 * External dependencies
 */
import { chunk, drop, take } from 'lodash';

/**
 * Internal dependencies
 */
import Row from './row';
import Column from './column';
import Gallery from './gallery';
import { MAX_COLUMNS } from '../constants';

export default function Square( { columns, renderedImages } ) {
	const columnCount = Math.min( MAX_COLUMNS, columns );

	const remainder = renderedImages.length % columnCount;

	return (
		<Gallery>
			{ [
				...( remainder ? [ take( renderedImages, remainder ) ] : [] ),
				...chunk( drop( renderedImages, remainder ), columnCount ),
			].map( ( imagesInRow, rowIndex ) => (
				<Row key={ rowIndex } className={ `columns-${ imagesInRow.length }` }>
					{ imagesInRow.map( ( image, colIndex ) => (
						<Column key={ colIndex }>{ image }</Column>
					) ) }
				</Row>
			) ) }
		</Gallery>
	);
}
