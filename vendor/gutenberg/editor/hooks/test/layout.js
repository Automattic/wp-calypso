/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * WordPress dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import '../layout';

describe( 'layout', () => {
	const blockSettings = {
		save: noop,
		category: 'common',
		title: 'block title',
	};

	describe( 'addAttribute()', () => {
		const registerBlockType = applyFilters.bind( null, 'blocks.registerBlockType' );

		it( 'should assign a new layout attribute', () => {
			const settings = registerBlockType( blockSettings );

			expect( settings.attributes ).toHaveProperty( 'layout' );
		} );
	} );

	describe( 'addSaveProps', () => {
		const getSaveContentExtraProps = applyFilters.bind( null, 'blocks.getSaveContent.extraProps' );

		it( 'should merge layout class name', () => {
			const attributes = { layout: 'wide' };
			const extraProps = getSaveContentExtraProps( {
				className: 'wizard',
			}, blockSettings, attributes );

			expect( extraProps.className ).toBe( 'wizard layout-wide' );
		} );
	} );

	describe( 'preserveLayoutAttribute', () => {
		const transformBlock = applyFilters.bind( null, 'blocks.switchToBlockType.transformedBlock' );

		it( 'should preserve layout attribute', () => {
			const blocks = [ { attributes: { layout: 'wide' } } ];
			const transformedBlock = transformBlock( { attributes: {} }, blocks );

			expect( transformedBlock.attributes.layout ).toBe( 'wide' );
		} );
	} );

	describe( 'excludeLayoutFromUnmodifiedBlockCheck', () => {
		const excludeLayoutAttribute = applyFilters.bind( null, 'blocks.isUnmodifiedDefaultBlock.attributes' );

		it( 'should exclude the layout attribute', () => {
			const attributeKeys = excludeLayoutAttribute( [ 'align', 'content', 'layout' ] );

			expect( attributeKeys ).toEqual( [ 'align', 'content' ] );
		} );
	} );
} );
