/**
 * External dependencies
 */
import { isValidBlock } from '@wordpress/blocks';
import { createElement } from '@wordpress/element';

describe( 'isValidBlock', () => {
	beforeAll( () => {
		// Load all hooks that modify blocks
		require( 'editor/hooks' );
	} );

	it( 'should use the namespace in the classname for non-core blocks', () => {
		const valid = isValidBlock(
			'<div class="wp-block-myplugin-fruit">Bananas</div>',
			{
				save: ( { attributes } ) => createElement( 'div', null, attributes.fruit ),
				name: 'myplugin/fruit',
			},
			{ fruit: 'Bananas' }
		);

		expect( valid ).toBe( true );
	} );

	it( 'should include additional classes in block attributes', () => {
		const valid = isValidBlock(
			'<div class="wp-block-myplugin-fruit fruit fresh">Bananas</div>',
			{
				save: ( { attributes } ) => createElement( 'div', {
					className: 'fruit',
				}, attributes.fruit ),
				name: 'myplugin/fruit',
			},
			{
				fruit: 'Bananas',
				className: 'fresh',
			}
		);

		expect( valid ).toBe( true );
	} );

	it( 'should not add a className if falsy', () => {
		const valid = isValidBlock(
			'<div>Bananas</div>',
			{
				save: ( { attributes } ) => createElement( 'div', null, attributes.fruit ),
				name: 'myplugin/fruit',
				supports: {
					className: false,
				},
			},
			{ fruit: 'Bananas' }
		);

		expect( valid ).toBe( true );
	} );
} );
