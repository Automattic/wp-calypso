/**
 * External dependencies
 */
import { findIndex } from 'lodash';

export function reducer( blocks, action ) {
	const i = findIndex( blocks, { id: action.id } );
	const newBlocks = [ ...blocks ];

	switch ( action.type ) {
		case 'update':
			newBlocks[ i ].rawContent = action.serialized;
			newBlocks[ i ].isDirty = true;
			return newBlocks;

		case 'moveUp':
			if ( i > 0 ) {
				newBlocks[ i ] = blocks[ i - 1 ];
				newBlocks[ i - 1 ] = blocks[ i ];
				return newBlocks;
			}

		case 'moveDown':
			if ( i < blocks.length - 1 ) {
				newBlocks[ i ] = blocks[ i + 1 ];
				newBlocks[ i + 1 ] = blocks[ i ];
				return newBlocks;
			}

	}

	return blocks;
}
