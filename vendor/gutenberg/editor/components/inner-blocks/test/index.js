/**
 * WordPress dependencies
 */
import {
	createBlock,
	getBlockType,
	getBlockTypes,
	setUnknownTypeHandlerName,
	getSaveElement,
	registerBlockType,
	serialize,
	unregisterBlockType,
} from '@wordpress/blocks';
import { renderToString } from '@wordpress/element';

/**
 * Internal dependencies
 */
import InnerBlocks from '../';

describe( 'InnerBlocks', () => {
	afterEach( () => {
		setUnknownTypeHandlerName( undefined );
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
	} );

	it( 'should return element as string, with inner blocks', () => {
		registerBlockType( 'core/fruit', {
			category: 'common',

			title: 'fruit',

			attributes: {
				fruit: {
					type: 'string',
				},
			},

			supports: {
				className: false,
			},

			save( { attributes } ) {
				return (
					<div>
						{ attributes.fruit }
						<InnerBlocks.Content />
					</div>
				);
			},
		} );

		const saved = renderToString(
			getSaveElement(
				getBlockType( 'core/fruit' ),
				{ fruit: 'Bananas' },
				[ createBlock( 'core/fruit', { fruit: 'Apples' } ) ],
			)
		);

		expect( saved ).toMatchSnapshot();
	} );

	it( 'should force serialize for invalid block with inner blocks', () => {
		const blockType = {
			attributes: {
				throw: {
					type: 'boolean',
				},
				defaulted: {
					type: 'boolean',
					default: false,
				},
				content: {
					type: 'string',
					source: 'text',
				},
				stuff: {
					type: 'string',
				},
			},
			save( { attributes } ) {
				if ( attributes.throw ) {
					throw new Error();
				}

				return (
					<p>
						{ attributes.content }
						<InnerBlocks.Content />
					</p>
				);
			},
			category: 'common',
			title: 'block title',
		};
		registerBlockType( 'core/test-block', blockType );
		const block = createBlock(
			'core/test-block',
			{ content: 'Invalid' },
			[ createBlock( 'core/test-block' ) ]
		);

		block.isValid = false;
		block.originalContent = 'Original';

		expect( serialize( block ) ).toMatchSnapshot();
	} );
} );
