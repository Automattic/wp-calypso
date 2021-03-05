/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { getMediaStorage, isRequestingMediaStorage, isOverMediaLimit } from '../selectors';

describe( 'selectors', () => {
	describe( '#getMediaStorage()', () => {
		test( 'should return media storage for a given site ID', () => {
			const state = {
				sites: {
					mediaStorage: {
						items: {
							2916284: {
								max_storage_bytes: 3221225472,
								storage_used_bytes: 56000,
							},
							77203074: {
								max_storage_bytes: 3221225472,
								storage_used_bytes: 323506,
							},
						},
					},
				},
			};
			const mediaStorage = getMediaStorage( state, 2916284 );

			expect( mediaStorage ).to.eql( {
				max_storage_bytes: 3221225472,
				storage_used_bytes: 56000,
			} );
		} );
	} );
	describe( '#isRequestingMediaStorage()', () => {
		test( 'should return fetching media storage state for a given site ID', () => {
			const state = {
				sites: {
					mediaStorage: {
						fetchingItems: {
							2916284: true,
							77203074: false,
						},
					},
				},
			};

			expect( isRequestingMediaStorage( state, 2916284 ) ).to.equal( true );
			expect( isRequestingMediaStorage( state, 77203074 ) ).to.equal( false );
			expect( isRequestingMediaStorage( state, 'not-defined' ) ).to.equal( false );
		} );
	} );
	describe( '#isOverMediaLimit()', () => {
		test( 'should return true if a site is over storage limits', () => {
			const state = {
				sites: {
					mediaStorage: {
						items: {
							2916284: {
								max_storage_bytes: 3221225472,
								storage_used_bytes: 3221225900,
							},
							77203074: {
								max_storage_bytes: 3221225472,
								storage_used_bytes: 323506,
							},
						},
					},
				},
			};

			expect( isOverMediaLimit( state, 2916284 ) ).to.equal( true );
			expect( isOverMediaLimit( state, 77203074 ) ).to.equal( false );
		} );
		test( 'should return false if a site is unlimited', () => {
			const state = {
				sites: {
					mediaStorage: {
						items: {
							2916284: {
								max_storage_bytes: -1,
								storage_used_bytes: -1,
							},
						},
					},
				},
			};

			expect( isOverMediaLimit( state, 2916284 ) ).to.equal( false );
		} );
		test( 'should return null if a media storage is not loaded yet', () => {
			const state = {
				sites: {
					mediaStorage: {
						items: {
							2916284: {
								max_storage_bytes: -1,
								storage_used_bytes: -1,
							},
						},
					},
				},
			};
			expect( isOverMediaLimit( state, 77203074 ) ).to.equal( null );
		} );
	} );
} );
