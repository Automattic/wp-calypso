/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getImageEditorIsGreaterThanMinimumDimensions from 'calypso/state/selectors/get-image-editor-is-greater-than-minimum-dimensions';

describe( 'getImageEditorIsGreaterThanMinimumDimensions()', () => {
	test( 'should return false if the image has not loaded yet and therefore originalAspectRatio not set', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions( {
			editor: {
				imageEditor: {
					originalAspectRatio: null,
				},
			},
		} );

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );
	test( 'should return false if the width value is not an integer', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				editor: {
					imageEditor: {
						originalAspectRatio: { width: null, height: 100 },
					},
				},
			},
			50,
			50
		);

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );
	test( 'should return false if the height value is not an integer', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				editor: {
					imageEditor: {
						originalAspectRatio: { width: 100, height: undefined },
					},
				},
			},
			50,
			50
		);

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );

	test( 'should return false if the dimensions do not meet the supplied minimum dimensions', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				editor: {
					imageEditor: {
						originalAspectRatio: { width: 45, height: 45 },
					},
				},
			},
			50,
			50
		);

		expect( isGreaterThanMinimumDimensions ).to.be.false;
	} );

	test( 'should return true if the dimensions meet the supplied minimum dimensions', () => {
		const isGreaterThanMinimumDimensions = getImageEditorIsGreaterThanMinimumDimensions(
			{
				editor: {
					imageEditor: {
						originalAspectRatio: { width: 100, height: 200 },
					},
				},
			},
			44,
			44
		);

		expect( isGreaterThanMinimumDimensions ).to.be.true;
	} );
} );
