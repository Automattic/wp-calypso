/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isDeletingSite } from '../';

describe( 'isDeletingSite()', () => {
	it( 'should return false if no requests have been triggered', () => {
		const isDeleting = isDeletingSite(
			{
				sites: {
					deleting: {},
				},
			},
			2916284
		);

		expect( isDeleting ).to.be.false;
	} );

	it( 'should return true if a request is in progress', () => {
		const isDeleting = isDeletingSite(
			{
				sites: {
					deleting: {
						2916284: true,
					},
				},
			},
			2916284
		);

		expect( isDeleting ).to.be.true;
	} );

	it( 'should return false after a request has completed', () => {
		const isDeleting = isDeletingSite(
			{
				sites: {
					deleting: {
						2916284: false,
					},
				},
			},
			2916284
		);

		expect( isDeleting ).to.be.false;
	} );
} );
