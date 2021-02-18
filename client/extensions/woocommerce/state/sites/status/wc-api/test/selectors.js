/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getLastApiError, getLastApiErrorCode, getLastApiErrorMessage } from '../selectors';

describe( 'selectors', () => {
	let stateWithoutError;
	let stateWithError;

	beforeEach( () => {
		stateWithoutError = {
			extensions: {
				woocommerce: {
					site: {
						1337: {
							status: {
								wcApi: {},
							},
						},
					},
				},
			},
		};

		stateWithError = {
			extensions: {
				woocommerce: {
					site: {
						1337: {
							status: {
								wcApi: {
									error: {
										data: {
											code: 404,
											message: 'Not found',
										},
									},
								},
							},
						},
					},
				},
			},
		};
	} );

	describe( 'getLastApiError', () => {
		test( 'should not provide an error if none is logged.', () => {
			expect( getLastApiError( stateWithoutError, 1337 ) ).to.not.exist;
		} );

		test( 'should not provide an error if no site data exists.', () => {
			expect( getLastApiError( stateWithoutError, 1338 ) ).to.not.exist;
		} );

		test( 'should provide last error if it exists.', () => {
			const err = getLastApiError( stateWithError, 1337 );
			expect( err ).to.exist;
			expect( err.code ).to.equal( 404 );
			expect( err.message ).to.equal( 'Not found' );
		} );
	} );

	describe( 'getLastApiErrorCode', () => {
		test( 'should not provide an error code if none is logged.', () => {
			expect( getLastApiErrorCode( stateWithoutError, 1337 ) ).to.not.exist;
		} );

		test( 'should not provide an error code if no site data exists.', () => {
			expect( getLastApiErrorCode( stateWithoutError, 1338 ) ).to.not.exist;
		} );

		test( 'should match output from getLastApiError.', () => {
			expect( getLastApiErrorCode( stateWithError, 1337 ) ).to.equal( 404 );
		} );
	} );

	describe( 'getLastApiErrorMessage', () => {
		test( 'should not provide an error message if none is logged.', () => {
			expect( getLastApiErrorCode( stateWithoutError, 1337 ) ).to.not.exist;
		} );

		test( 'should not provide an error message if no site data exists.', () => {
			expect( getLastApiErrorCode( stateWithoutError, 1338 ) ).to.not.exist;
		} );

		test( 'should match output from getLastApiError.', () => {
			expect( getLastApiErrorMessage( stateWithError, 1337 ) ).to.equal( 'Not found' );
		} );
	} );
} );
