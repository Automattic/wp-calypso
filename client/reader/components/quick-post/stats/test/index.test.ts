/**
 * @jest-environment jsdom
 */
import { createBlock, serialize } from '@wordpress/blocks';
import { getBlocksUsage } from '..';

describe( 'getBlocksUsage', () => {
	it( 'should return the correct stats', () => {
		const content = serialize( [
			createBlock( 'paragraph', {
				content: 'World',
			} ),
		] );

		const stats = getBlocksUsage( content );

		expect( stats ).toHaveProperty( 'paragraph_count', 1 );
	} );
} );
