/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMediaStorageUsed } from '..';

describe( 'getMediaStorageUsed()', () => {
	it( 'should return null if the site is unknown', () => {
		const state = {
			sites: {
				mediaStorage: {
					items: {
						456: { storage_used_bytes: 12345 },
					},
				},
			},
		};

		expect( getMediaStorageUsed( state ) ).to.be.null;
		expect( getMediaStorageUsed( state, 123 ) ).to.be.null;
	} );

	it( 'should return null if usage is unknown', () => {
		const state = {
			sites: {
				mediaStorage: {
					items: {
						123: {},
						456: { storage_used_bytes: 12345 },
					},
				},
			},
		};
		expect( getMediaStorageUsed( state, 123 ) ).to.be.null;
	} );

	it( 'should return the storage used for a site', () => {
		const storage_used_bytes = 1029384756;
		const result = getMediaStorageUsed(
			{
				sites: {
					mediaStorage: {
						items: {
							123: {
								storage_used_bytes,
							},
						},
					},
				},
			},
			123
		);

		expect( result ).to.equal( storage_used_bytes );
	} );
} );
