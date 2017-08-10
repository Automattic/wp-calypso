/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRtl } from '../';

describe( 'isRtl()', () => {
	it( 'should return null if there is no current user', () => {
		const result = isRtl( {
			currentUser: {
				id: null,
			},
		} );

		expect( result ).to.be.null;
	} );

	it( 'should return null if the value is not known', () => {
		const result = isRtl( {
			users: {
				items: {
					123: { ID: 123 },
				},
			},
			currentUser: {
				id: 123,
			},
		} );

		expect( result ).to.be.null;
	} );

	it( 'should return true if the value is true', () => {
		const result = isRtl( {
			users: {
				items: {
					123: { ID: 123, isRTL: true },
				},
			},
			currentUser: {
				id: 123,
			},
		} );

		expect( result ).to.be.true;
	} );

	it( 'should return false if the value is false', () => {
		const result = isRtl( {
			users: {
				items: {
					123: { ID: 123, isRTL: false },
				},
			},
			currentUser: {
				id: 123,
			},
		} );

		expect( result ).to.be.false;
	} );
} );
