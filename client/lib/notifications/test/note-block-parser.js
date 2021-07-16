/**
 * External dependencies
 */
import { expect } from 'chai';

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

		expect( result ).to.deep.equal( expected );
	} );

	test( 'old parsing when block contained type and url is not longer valid', () => {
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

		const oldExpected = [
			'New Order: ',
			{
				type: 'a',
				children: [ 'Order #339' ],
			},
		];

		const result = parseBlock( context );

		expect( result ).to.deep.not.equal( oldExpected );
		expect( result[ 1 ] ).to.have.ownPropertyDescriptor( 'url' );
	} );
} );
