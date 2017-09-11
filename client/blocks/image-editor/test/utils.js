/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { AspectRatios } from 'state/ui/editor/image-editor/constants';
import { getDefaultAspectRatio } from '../utils';

describe( 'getDefaultAspectRatio', () => {
	context( 'when only aspectRatio is given', () => {
		context( 'when aspectRatio is valid', () => {
			it( 'returns the aspectRatio', () => {
				const expected = 'ASPECT_1X1';
				const actual = getDefaultAspectRatio( 'ASPECT_1X1' );

				expect( actual ).to.equal( expected );
			} );
		} );

		context( 'when aspectRatio is invalid', () => {
			it( 'returns the value of AspectRatios.FREE', () => {
				const expected = AspectRatios.FREE;
				const actual = getDefaultAspectRatio( 'INVALID_ASPECT' );

				expect( actual ).to.equal( expected );
			} );
		} );
	} );

	context( 'when only aspectRatios is given', () => {
		context( 'when aspectRatios is valid', () => {
			it( 'returns the first given aspectRatio', () => {
				const expected = 'ASPECT_1X1';
				const actual = getDefaultAspectRatio( null, [ 'ASPECT_1X1' ] );

				expect( actual ).to.equal( expected );
			} );
		} );

		context( 'when aspectRatios is invalid', () => {
			it( 'returns the value of AspectRatios.FREE', () => {
				const expected = AspectRatios.FREE;
				const actual = getDefaultAspectRatio( null, [ 'INVALID_ASPECT' ] );

				expect( actual ).to.equal( expected );
			} );
		} );
	} );

	context( 'when both aspectRatio & aspectRatios are given', () => {
		context( 'when aspectRatios includes the given aspectRatio', () => {
			context( 'when the given aspectRatio is valid', () => {
				it( 'returns the given aspectRatio', () => {
					const expected = 'ASPECT_1X1';
					const actual = getDefaultAspectRatio( 'ASPECT_1X1', [ 'INVALID_ASPECT', 'ASPECT_1X1' ] );

					expect( actual ).to.equal( expected );
				} );
			} );

			context( 'when the given aspectRatio is invalid', () => {
				it( 'returns the value of AspectRatios.FREE', () => {
					const expected = AspectRatios.FREE;
					const actual = getDefaultAspectRatio( 'INVALID_ASPECT', [ 'INVALID_ASPECT', 'ASPECT_1X1' ] );

					expect( actual ).to.equal( expected );
				} );
			} );
		} );

		context( 'when aspectRatios does not include the given aspectRatio', () => {
			context( 'when the given aspectRatios starts with a valid aspectRatio', () => {
				it( 'returns that valid aspectRatio', () => {
					const expected = 'ASPECT_1X1';
					const actual = getDefaultAspectRatio( 'INVALID_ASPECT', [ 'ASPECT_1X1' ] );

					expect( actual ).to.equal( expected );
				} );
			} );

			context( 'when the given aspectRatios does not start with a valid aspectRatio', () => {
				it( 'returns the value of AspectRatios.FREE', () => {
					const expected = AspectRatios.FREE;
					const actual = getDefaultAspectRatio( 'OTHER_INVALID_ASPECT', [ 'INVALID_ASPECT' ] );

					expect( actual ).to.equal( expected );
				} );
			} );
		} );
	} );
} );
