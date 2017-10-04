/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getImageEditorIsGreaterThanMinimumDimensions } from '../';

describe( 'getImageEditorIsGreaterThanMinimumDimensions()', () => {
	it( 'should return false if the image has not loaded yet and therefore originalAspectRatio not set', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions( {
			ui: {
				editor: {
					imageEditor: {
						originalAspectRatio: null,
					},
				},
			},
		} );

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );
	it( 'should return false if the width value is not an integer', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				ui: {
					editor: {
						imageEditor: {
							originalAspectRatio: { width: null, height: 100 },
						},
					},
				},
			},
			50,
			50
		);

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );
	it( 'should return false if the height value is not an integer', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				ui: {
					editor: {
						imageEditor: {
							originalAspectRatio: { width: 100, height: undefined },
						},
					},
				},
			},
			50,
			50
		);

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );

	it( 'should return false if the dimensions do not meet the supplied minimum dimensions', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				ui: {
					editor: {
						imageEditor: {
							originalAspectRatio: { width: 45, height: 45 },
						},
					},
				},
			},
			50,
			50
		);

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );

	it( 'should return true if the dimensions meet the supplied minimum dimensions', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				ui: {
					editor: {
						imageEditor: {
							originalAspectRatio: { width: 100, height: 200 },
						},
					},
				},
			},
			44,
			44
		);

		expect( isGreaterThanMinimumDimensions ).to.be.true;
	} );
} );
