/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { AspectRatios } from 'calypso/state/editor/image-editor/constants';
import { getDefaultAspectRatio } from '../utils';

describe( 'getDefaultAspectRatio', () => {
	describe( 'when only aspectRatio is given', () => {
		describe( 'when aspectRatio is valid', () => {
			it( 'returns the aspectRatio', () => {
				const expected = 'ASPECT_1X1';
				const actual = getDefaultAspectRatio( 'ASPECT_1X1' );

				expect( actual ).to.equal( expected );
			} );
		} );

		describe( 'when aspectRatio is invalid', () => {
			it( 'returns the value of AspectRatios.FREE', () => {
				const expected = AspectRatios.FREE;
				const actual = getDefaultAspectRatio( 'INVALID_ASPECT' );

				expect( actual ).to.equal( expected );
			} );
		} );
	} );

	describe( 'when only aspectRatios is given', () => {
		describe( 'when aspectRatios is valid', () => {
			it( 'returns the first given aspectRatio', () => {
				const expected = 'ASPECT_1X1';
				const actual = getDefaultAspectRatio( null, [ 'ASPECT_1X1' ] );

				expect( actual ).to.equal( expected );
			} );
		} );

		describe( 'when aspectRatios is invalid', () => {
			it( 'returns the value of AspectRatios.FREE', () => {
				const expected = AspectRatios.FREE;
				const actual = getDefaultAspectRatio( null, [ 'INVALID_ASPECT' ] );

				expect( actual ).to.equal( expected );
			} );
		} );
	} );

	describe( 'when both aspectRatio & aspectRatios are given', () => {
		describe( 'when aspectRatios includes the given aspectRatio', () => {
			describe( 'when the given aspectRatio is valid', () => {
				it( 'returns the given aspectRatio', () => {
					const expected = 'ASPECT_1X1';
					const actual = getDefaultAspectRatio( 'ASPECT_1X1', [ 'INVALID_ASPECT', 'ASPECT_1X1' ] );

					expect( actual ).to.equal( expected );
				} );
			} );

			describe( 'when the given aspectRatio is invalid', () => {
				it( 'returns the value of AspectRatios.FREE', () => {
					const expected = AspectRatios.FREE;
					const actual = getDefaultAspectRatio( 'INVALID_ASPECT', [
						'INVALID_ASPECT',
						'ASPECT_1X1',
					] );

					expect( actual ).to.equal( expected );
				} );
			} );
		} );

		describe( 'when aspectRatios does not include the given aspectRatio', () => {
			describe( 'when the given aspectRatios starts with a valid aspectRatio', () => {
				it( 'returns that valid aspectRatio', () => {
					const expected = 'ASPECT_1X1';
					const actual = getDefaultAspectRatio( 'INVALID_ASPECT', [ 'ASPECT_1X1' ] );

					expect( actual ).to.equal( expected );
				} );
			} );

			describe( 'when the given aspectRatios does not start with a valid aspectRatio', () => {
				it( 'returns the value of AspectRatios.FREE', () => {
					const expected = AspectRatios.FREE;
					const actual = getDefaultAspectRatio( 'OTHER_INVALID_ASPECT', [ 'INVALID_ASPECT' ] );

					expect( actual ).to.equal( expected );
				} );
			} );
		} );
	} );
} );
