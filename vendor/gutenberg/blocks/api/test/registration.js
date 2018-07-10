/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { addFilter, removeFilter } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import {
	registerBlockType,
	unregisterBlockType,
	setUnknownTypeHandlerName,
	getUnknownTypeHandlerName,
	setDefaultBlockName,
	getDefaultBlockName,
	getBlockType,
	getBlockTypes,
	getBlockSupport,
	hasBlockSupport,
	isSharedBlock,
} from '../registration';

describe( 'blocks', () => {
	const defaultBlockSettings = { save: noop, category: 'common', title: 'block title' };

	beforeAll( () => {
		// Initialize the block store.
		require( '../../store' );
	} );

	afterEach( () => {
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
		setUnknownTypeHandlerName( undefined );
		setDefaultBlockName( undefined );
		window._wpBlocks = {};
	} );

	describe( 'registerBlockType()', () => {
		it( 'should reject numbers', () => {
			const block = registerBlockType( 999 );
			expect( console ).toHaveErroredWith( 'Block names must be strings.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks without a namespace', () => {
			const block = registerBlockType( 'doing-it-wrong' );
			expect( console ).toHaveErroredWith( 'Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with too many namespaces', () => {
			const block = registerBlockType( 'doing/it/wrong' );
			expect( console ).toHaveErroredWith( 'Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with invalid characters', () => {
			const block = registerBlockType( 'still/_doing_it_wrong' );
			expect( console ).toHaveErroredWith( 'Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with uppercase characters', () => {
			const block = registerBlockType( 'Core/Paragraph' );
			expect( console ).toHaveErroredWith( 'Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks not starting with a letter', () => {
			const block = registerBlockType( 'my-plugin/4-fancy-block', defaultBlockSettings );
			expect( console ).toHaveErroredWith( 'Block names must contain a namespace prefix, include only lowercase alphanumeric characters or dashes, and start with a letter. Example: my-plugin/my-custom-block' );
			expect( block ).toBeUndefined();
		} );

		it( 'should accept valid block names', () => {
			const block = registerBlockType( 'my-plugin/fancy-block-4', defaultBlockSettings );
			expect( console ).not.toHaveErrored();
			expect( block ).toEqual( {
				name: 'my-plugin/fancy-block-4',
				icon: {
					src: 'block-default',
				},
				save: noop,
				category: 'common',
				title: 'block title',
			} );
		} );

		it( 'should prohibit registering the same block twice', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );
			const block = registerBlockType( 'core/test-block', defaultBlockSettings );
			expect( console ).toHaveErroredWith( 'Block "core/test-block" is already registered.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks without a save function', () => {
			const block = registerBlockType( 'my-plugin/fancy-block-5' );
			expect( console ).toHaveErroredWith( 'The "save" property must be specified and must be a valid function.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with an invalid edit function', () => {
			const blockType = { save: noop, edit: 'not-a-function', category: 'common', title: 'block title' },
				block = registerBlockType( 'my-plugin/fancy-block-6', blockType );
			expect( console ).toHaveErroredWith( 'The "edit" property must be a valid function.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with more than 3 keywords', () => {
			const blockType = { save: noop, keywords: [ 'apple', 'orange', 'lemon', 'pineapple' ], category: 'common', title: 'block title' },
				block = registerBlockType( 'my-plugin/fancy-block-7', blockType );
			expect( console ).toHaveErroredWith( 'The block "my-plugin/fancy-block-7" can have a maximum of 3 keywords.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks without category', () => {
			const blockType = { settingName: 'settingValue', save: noop, title: 'block title' },
				block = registerBlockType( 'my-plugin/fancy-block-8', blockType );
			expect( console ).toHaveErroredWith( 'The block "my-plugin/fancy-block-8" must have a category.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with non registered category.', () => {
			const blockType = { save: noop, category: 'custom-category-slug', title: 'block title' },
				block = registerBlockType( 'my-plugin/fancy-block-9', blockType );
			expect( console ).toHaveErroredWith( 'The block "my-plugin/fancy-block-9" must have a registered category.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks without title', () => {
			const blockType = { settingName: 'settingValue', save: noop, category: 'common' },
				block = registerBlockType( 'my-plugin/fancy-block-9', blockType );
			expect( console ).toHaveErroredWith( 'The block "my-plugin/fancy-block-9" must have a title.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject blocks with empty titles', () => {
			const blockType = { settingName: 'settingValue', save: noop, category: 'common', title: '' },
				block = registerBlockType( 'my-plugin/fancy-block-10', blockType );
			expect( console ).toHaveErroredWith( 'The block "my-plugin/fancy-block-10" must have a title.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should reject titles which are not strings', () => {
			const blockType = { settingName: 'settingValue', save: noop, category: 'common', title: 12345 },
				block = registerBlockType( 'my-plugin/fancy-block-11', blockType );
			expect( console ).toHaveErroredWith( 'Block titles must be strings.' );
			expect( block ).toBeUndefined();
		} );

		it( 'should default to browser-initialized global attributes', () => {
			const attributes = { ok: { type: 'boolean' } };
			window._wpBlocks = {
				'core/test-block-with-attributes': { attributes },
			};

			const blockType = { settingName: 'settingValue', save: noop, category: 'common', title: 'block title' };
			registerBlockType( 'core/test-block-with-attributes', blockType );
			expect( getBlockType( 'core/test-block-with-attributes' ) ).toEqual( {
				name: 'core/test-block-with-attributes',
				settingName: 'settingValue',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: 'block-default',
				},
				attributes: {
					ok: {
						type: 'boolean',
					},
				},
			} );
		} );

		it( 'should validate the icon', () => {
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: { chicken: 'ribs' },
			};
			const block = registerBlockType( 'core/test-block-icon-normalize-element', blockType );
			expect( console ).toHaveErrored();
			expect( block ).toBeUndefined();
		} );

		it( 'should normalize the icon containing an element', () => {
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: ( <svg width="20" height="20" viewBox="0 0 20 20">
					<circle cx="10" cy="10" r="10"
						fill="red" stroke="blue" strokeWidth="10" />
				</svg> ),
			};
			registerBlockType( 'core/test-block-icon-normalize-element', blockType );
			expect( getBlockType( 'core/test-block-icon-normalize-element' ) ).toEqual( {
				name: 'core/test-block-icon-normalize-element',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: ( <svg width="20" height="20" viewBox="0 0 20 20">
						<circle cx="10" cy="10" r="10"
							fill="red" stroke="blue" strokeWidth="10" />
					</svg> ),
				},
			} );
		} );

		it( 'should normalize the icon containing a string', () => {
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: 'foo',
			};
			registerBlockType( 'core/test-block-icon-normalize-string', blockType );
			expect( getBlockType( 'core/test-block-icon-normalize-string' ) ).toEqual( {
				name: 'core/test-block-icon-normalize-string',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: 'foo',
				},
			} );
		} );

		it( 'should normalize the icon containing a function', () => {
			const MyTestIcon = () => {
				return <svg width="20" height="20" viewBox="0 0 20 20">
					<circle cx="10" cy="10" r="10"
						fill="red" stroke="blue" strokeWidth="10" />
				</svg>;
			};
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: MyTestIcon,
			};
			registerBlockType( 'core/test-block-icon-normalize-function', blockType );
			expect( getBlockType( 'core/test-block-icon-normalize-function' ) ).toEqual( {
				name: 'core/test-block-icon-normalize-function',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: MyTestIcon,
				},
			} );
		} );

		it( 'should correctly register an icon with background and a custom svg', () => {
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					background: '#f00',
					src: ( <svg width="20" height="20" viewBox="0 0 20 20">
						<circle cx="10" cy="10" r="10"
							fill="red" stroke="blue" strokeWidth="10" />
					</svg> ),
				},
			};
			registerBlockType( 'core/test-block-icon-normalize-background', blockType );
			expect( getBlockType( 'core/test-block-icon-normalize-background' ) ).toEqual( {
				name: 'core/test-block-icon-normalize-background',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					background: '#f00',
					foreground: '#191e23',
					shadowColor: 'rgba(255, 0, 0, 0.3)',
					src: ( <svg width="20" height="20" viewBox="0 0 20 20">
						<circle cx="10" cy="10" r="10"
							fill="red" stroke="blue" strokeWidth="10" />
					</svg> ),
				},
			} );
		} );

		it( 'should warn if the icon background and foreground are not readable', () => {
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					background: '#f00',
					foreground: '#d00',
					src: 'block-default',
				},
			};
			registerBlockType( 'core/test-block-icon-unreadable', blockType );
			expect( console ).toHaveWarned();
		} );

		it( 'should  not warn if the icon background and foreground are readable', () => {
			const blockType = {
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					background: '#f00',
					foreground: '#000',
					src: 'block-default',
				},
			};
			registerBlockType( 'core/test-block-icon-readable', blockType );
			expect( getBlockType( 'core/test-block-icon-readable' ).name ).toEqual(
				'core/test-block-icon-readable'
			);
		} );

		it( 'should store a copy of block type', () => {
			const blockType = { settingName: 'settingValue', save: noop, category: 'common', title: 'block title' };
			registerBlockType( 'core/test-block-with-settings', blockType );
			blockType.mutated = true;
			expect( getBlockType( 'core/test-block-with-settings' ) ).toEqual( {
				name: 'core/test-block-with-settings',
				settingName: 'settingValue',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: 'block-default',
				},
			} );
		} );

		describe( 'applyFilters', () => {
			afterEach( () => {
				removeFilter( 'blocks.registerBlockType', 'core/blocks/without-title' );
			} );

			it( 'should reject valid blocks when they become invalid after executing filter', () => {
				addFilter( 'blocks.registerBlockType', 'core/blocks/without-title', ( settings ) => {
					return {
						...settings,
						title: '',
					};
				} );
				const block = registerBlockType( 'my-plugin/fancy-block-12', defaultBlockSettings );
				expect( console ).toHaveErroredWith( 'The block "my-plugin/fancy-block-12" must have a title.' );
				expect( block ).toBeUndefined();
			} );
		} );
	} );

	describe( 'unregisterBlockType()', () => {
		it( 'should fail if a block is not registered', () => {
			const oldBlock = unregisterBlockType( 'core/test-block' );
			expect( console ).toHaveErroredWith( 'Block "core/test-block" is not registered.' );
			expect( oldBlock ).toBeUndefined();
		} );

		it( 'should unregister existing blocks', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );
			expect( getBlockTypes() ).toEqual( [
				{
					name: 'core/test-block',
					save: noop,
					category: 'common',
					title: 'block title',
					icon: {
						src: 'block-default',
					},
				},
			] );
			const oldBlock = unregisterBlockType( 'core/test-block' );
			expect( console ).not.toHaveErrored();
			expect( oldBlock ).toEqual( {
				name: 'core/test-block',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: 'block-default',
				},
			} );
			expect( getBlockTypes() ).toEqual( [] );
		} );
	} );

	describe( 'setUnknownTypeHandlerName()', () => {
		it( 'assigns unknown type handler', () => {
			setUnknownTypeHandlerName( 'core/test-block' );

			expect( getUnknownTypeHandlerName() ).toBe( 'core/test-block' );
		} );
	} );

	describe( 'getUnknownTypeHandlerName()', () => {
		it( 'defaults to undefined', () => {
			expect( getUnknownTypeHandlerName() ).toBeNull();
		} );
	} );

	describe( 'setDefaultBlockName()', () => {
		it( 'assigns default block name', () => {
			setDefaultBlockName( 'core/test-block' );

			expect( getDefaultBlockName() ).toBe( 'core/test-block' );
		} );
	} );

	describe( 'getDefaultBlockName()', () => {
		it( 'defaults to undefined', () => {
			expect( getDefaultBlockName() ).toBeNull();
		} );
	} );

	describe( 'getBlockType()', () => {
		it( 'should return { name, save } for blocks with minimum settings', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );
			expect( getBlockType( 'core/test-block' ) ).toEqual( {
				name: 'core/test-block',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: 'block-default',
				},
			} );
		} );

		it( 'should return all block type elements', () => {
			const blockType = { settingName: 'settingValue', save: noop, category: 'common', title: 'block title' };
			registerBlockType( 'core/test-block-with-settings', blockType );
			expect( getBlockType( 'core/test-block-with-settings' ) ).toEqual( {
				name: 'core/test-block-with-settings',
				settingName: 'settingValue',
				save: noop,
				category: 'common',
				title: 'block title',
				icon: {
					src: 'block-default',
				},
			} );
		} );
	} );

	describe( 'getBlockTypes()', () => {
		it( 'should return an empty array at first', () => {
			expect( getBlockTypes() ).toEqual( [] );
		} );

		it( 'should return all registered blocks', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );
			const blockType = { settingName: 'settingValue', save: noop, category: 'common', title: 'block title' };
			registerBlockType( 'core/test-block-with-settings', blockType );
			expect( getBlockTypes() ).toEqual( [
				{
					name: 'core/test-block',
					save: noop,
					category: 'common',
					title: 'block title',
					icon: {
						src: 'block-default',
					},
				},
				{
					name: 'core/test-block-with-settings',
					settingName: 'settingValue',
					save: noop,
					category: 'common',
					title: 'block title',
					icon: {
						src: 'block-default',
					},
				},
			] );
		} );
	} );

	describe( 'getBlockSupport', () => {
		it( 'should return undefined if block has no supports', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					bar: true,
				},
			} );

			expect( getBlockSupport( 'core/test-block', 'foo' ) ).toBe( undefined );
		} );

		it( 'should return block supports value', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					bar: true,
				},
			} );

			expect( getBlockSupport( 'core/test-block', 'bar' ) ).toBe( true );
		} );

		it( 'should return custom default supports if block does not define support by name', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					bar: true,
				},
			} );

			expect( getBlockSupport( 'core/test-block', 'foo', true ) ).toBe( true );
		} );
	} );

	describe( 'hasBlockSupport', () => {
		it( 'should return false if block has no supports', () => {
			registerBlockType( 'core/test-block', defaultBlockSettings );

			expect( hasBlockSupport( 'core/test-block', 'foo' ) ).toBe( false );
		} );

		it( 'should return false if block does not define support by name', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					bar: true,
				},
			} );

			expect( hasBlockSupport( 'core/test-block', 'foo' ) ).toBe( false );
		} );

		it( 'should return custom default supports if block does not define support by name', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					bar: true,
				},
			} );

			expect( hasBlockSupport( 'core/test-block', 'foo', true ) ).toBe( true );
		} );

		it( 'should return true if block type supports', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					foo: true,
				},
			} );

			expect( hasBlockSupport( 'core/test-block', 'foo' ) ).toBe( true );
		} );

		it( 'should return true if block author defines unsupported but truthy value', () => {
			registerBlockType( 'core/test-block', {
				...defaultBlockSettings,
				supports: {
					foo: 'hmmm',
				},
			} );

			expect( hasBlockSupport( 'core/test-block', 'foo' ) ).toBe( true );
		} );

		it( 'should handle block settings object as argument to test', () => {
			const settings = {
				...defaultBlockSettings,
				supports: {
					foo: true,
				},
			};

			expect( hasBlockSupport( settings, 'foo' ) ).toBe( true );
		} );
	} );

	describe( 'isSharedBlock', () => {
		it( 'should return true for a shared block', () => {
			const block = { name: 'core/block' };
			expect( isSharedBlock( block ) ).toBe( true );
		} );

		it( 'should return false for other blocks', () => {
			const block = { name: 'core/paragraph' };
			expect( isSharedBlock( block ) ).toBe( false );
		} );
	} );
} );
