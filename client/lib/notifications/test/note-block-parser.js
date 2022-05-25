/**
 * Internal dependencies
 */
import { parseBlock } from '../note-block-parser';

describe( 'Test parsing blocks with url and type', () => {
	test( 'block with url and type will be parsed like linkNode', () => {
		const context = {
			text: 'New Order: Order #339',
			ranges: [
				{
					url: 'https://examplesite/wp-admin/post.php?post=339&action=edit',
					indices: [ 11, 21 ],
					type: 'a',
					section: 'shop_order',
					intent: 'edit',
				},
			],
		};

		const expected = [
			'New Order: ',
			{
				type: 'link',
				url: 'https://examplesite/wp-admin/post.php?post=339&action=edit',
				intent: 'edit',
				section: 'shop_order',
				children: [ 'Order #339' ],
			},
		];

		const result = parseBlock( context );

		expect( result ).toEqual( expected );
	} );
} );
