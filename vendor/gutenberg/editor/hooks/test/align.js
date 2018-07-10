/**
 * External dependencies
 */
import { noop } from 'lodash';
import renderer from 'react-test-renderer';

/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';
import {
	getBlockTypes,
	registerBlockType,
	unregisterBlockType,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import {
	getBlockValidAlignments,
	withToolbarControls,
	withDataAlign,
	addAssignedAlign,
} from '../align';

describe( 'align', () => {
	const blockSettings = {
		save: noop,
		category: 'common',
		title: 'block title',
	};

	afterEach( () => {
		getBlockTypes().forEach( ( block ) => {
			unregisterBlockType( block.name );
		} );
	} );

	describe( 'addAttribute()', () => {
		const filterRegisterBlockType = applyFilters.bind( null, 'blocks.registerBlockType' );

		it( 'should do nothing if the block settings does not define align support', () => {
			const settings = filterRegisterBlockType( blockSettings );

			expect( settings.attributes ).toBeUndefined();
		} );

		it( 'should assign a new align attribute', () => {
			const settings = filterRegisterBlockType( {
				...blockSettings,
				supports: {
					align: true,
				},
			} );

			expect( settings.attributes ).toHaveProperty( 'align' );
		} );
	} );

	describe( 'getBlockValidAlignments()', () => {
		it( 'should return an empty array if block does not define align support', () => {
			registerBlockType( 'core/foo', blockSettings );
			const validAlignments = getBlockValidAlignments( 'core/foo' );

			expect( validAlignments ).toEqual( [] );
		} );

		it( 'should return all custom align set', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: [ 'left', 'right' ],
				},
			} );
			const validAlignments = getBlockValidAlignments( 'core/foo' );

			expect( validAlignments ).toEqual( [ 'left', 'right' ] );
		} );

		it( 'should return all aligns if block defines align support', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: true,
				},
			} );
			const validAlignments = getBlockValidAlignments( 'core/foo' );

			expect( validAlignments ).toEqual( [ 'left', 'center', 'right', 'wide', 'full' ] );
		} );

		it( 'should return all aligns except wide if wide align explicitly false', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: true,
					wideAlign: false,
				},
			} );
			const validAlignments = getBlockValidAlignments( 'core/foo' );

			expect( validAlignments ).toEqual( [ 'left', 'center', 'right' ] );
		} );
	} );

	describe( 'withToolbarControls', () => {
		it( 'should do nothing if no valid alignments', () => {
			registerBlockType( 'core/foo', blockSettings );

			const EnhancedComponent = withToolbarControls( ( { wrapperProps } ) => (
				<div { ...wrapperProps } />
			) );

			const wrapper = renderer.create(
				<EnhancedComponent
					name="core/foo"
					attributes={ {} }
					isSelected
				/>
			);
			// when there's only one child, `rendered` in the tree is an object not an array.
			expect( wrapper.toTree().rendered ).toBeInstanceOf( Object );
		} );

		it( 'should render toolbar controls if valid alignments', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: true,
					wideAlign: false,
				},
			} );

			const EnhancedComponent = withToolbarControls( ( { wrapperProps } ) => (
				<div { ...wrapperProps } />
			) );

			const wrapper = renderer.create(
				<EnhancedComponent
					name="core/foo"
					attributes={ {} }
					isSelected
				/>
			);
			expect( wrapper.toTree().rendered ).toHaveLength( 2 );
		} );
	} );

	describe( 'withDataAlign', () => {
		it( 'should render with wrapper props', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: true,
					wideAlign: false,
				},
			} );

			const EnhancedComponent = withDataAlign( ( { wrapperProps } ) => (
				<div { ...wrapperProps } />
			) );

			const wrapper = renderer.create(
				<EnhancedComponent
					block={ {
						name: 'core/foo',
						attributes: {
							align: 'left',
						},
					} }
				/>
			);
			expect( wrapper.toTree().rendered.props.wrapperProps ).toEqual( {
				'data-align': 'left',
			} );
		} );

		it( 'should not render invalid align', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: true,
					wideAlign: false,
				},
			} );

			const EnhancedComponent = withDataAlign( ( { wrapperProps } ) => (
				<div { ...wrapperProps } />
			) );

			const wrapper = renderer.create(
				<EnhancedComponent
					block={ {
						name: 'core/foo',
						attributes: {
							align: 'wide',
						},
					} }
				/>
			);

			expect( wrapper.toTree().props.wrapperProps ).toBeUndefined();
		} );
	} );

	describe( 'addAssignedAlign', () => {
		it( 'should do nothing if block does not support align', () => {
			registerBlockType( 'core/foo', blockSettings );

			const props = addAssignedAlign( {
				className: 'foo',
			}, 'core/foo', {
				align: 'wide',
			} );

			expect( props ).toEqual( {
				className: 'foo',
			} );
		} );

		it( 'should do add align classname if block supports align', () => {
			registerBlockType( 'core/foo', {
				...blockSettings,
				supports: {
					align: true,
				},
			} );

			const props = addAssignedAlign( {
				className: 'foo',
			}, 'core/foo', {
				align: 'wide',
			} );

			expect( props ).toEqual( {
				className: 'alignwide foo',
			} );
		} );
	} );
} );
