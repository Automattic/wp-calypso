/**
 * External dependencies
 */
import { noop } from 'lodash';

/**
 * External dependencies
 */
import { applyFilters } from '@wordpress/hooks';

/**
 * Internal dependencies
 */
import '../generated-class-name';

describe( 'generated className', () => {
	const blockSettings = {
		name: 'chicken/ribs',
		save: noop,
		category: 'common',
		title: 'block title',
	};

	describe( 'addSaveProps', () => {
		const addSaveProps = applyFilters.bind( null, 'blocks.getSaveContent.extraProps' );

		it( 'should do nothing if the block settings do not define generated className support', () => {
			const attributes = { className: 'foo' };
			const extraProps = addSaveProps( {}, {
				...blockSettings,
				supports: {
					className: false,
				},
			}, attributes );

			expect( extraProps ).not.toHaveProperty( 'className' );
		} );

		it( 'should inject the generated className', () => {
			const attributes = { className: 'bar' };
			const extraProps = addSaveProps( { className: 'foo' }, blockSettings, attributes );

			expect( extraProps.className ).toBe( 'wp-block-chicken-ribs foo' );
		} );

		it( 'should not inject duplicates into className', () => {
			const attributes = { className: 'bar' };
			const extraProps = addSaveProps( { className: 'foo wp-block-chicken-ribs' }, blockSettings, attributes );

			expect( extraProps.className ).toBe( 'wp-block-chicken-ribs foo' );
		} );
	} );
} );
