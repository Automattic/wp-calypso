/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getMediaStorageLimit from 'calypso/state/selectors/get-media-storage-limit';

describe( 'getMediaStorageLimit()', () => {
	test( 'should return null if the site is unknown', () => {
		const state = {
			sites: {
				mediaStorage: {
					items: {
						456: { max_storage_bytes: 12345 },
					},
				},
			},
		};

		expect( getMediaStorageLimit( state ) ).to.be.null;
		expect( getMediaStorageLimit( state, 123 ) ).to.be.null;
	} );

	test( 'should return null if the limit is unknown', () => {
		const state = {
			sites: {
				mediaStorage: {
					items: {
						123: {},
						456: { max_storage_bytes: 12345 },
					},
				},
			},
		};
		expect( getMediaStorageLimit( state, 123 ) ).to.be.null;
	} );

	test( 'should return the limit for a site', () => {
		const max_storage_bytes = 1029384756;
		const result = getMediaStorageLimit(
			{
				sites: {
					mediaStorage: {
						items: {
							123: {
								max_storage_bytes,
							},
						},
					},
				},
			},
			123
		);

		expect( result ).to.equal( max_storage_bytes );
	} );
} );
