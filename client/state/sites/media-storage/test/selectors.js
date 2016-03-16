/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	getMediaStorage,
	isRequestingMediaStorage
} from '../selectors';

describe( 'selectors', () => {
	describe( '#getMediaStorage()', () => {
		it( 'should return media storage for a given site ID', () => {
			const state = deepFreeze( {
				sites: {
					mediaStorage: {
						items: {
							2916284: {
								max_storage_bytes: 3221225472,
								storage_used_bytes: 56000
							},
							77203074: {
								max_storage_bytes: 3221225472,
								storage_used_bytes: 323506
							}
						}
					}
				}
			} );
			const mediaStorage = getMediaStorage( state, 2916284 );

			expect( mediaStorage ).to.eql( {
				max_storage_bytes: 3221225472,
				storage_used_bytes: 56000
			} );
		} );
	} );
	describe( '#isRequestingMediaStorage()', () => {
		it( 'should return fetching media storage state for a given site ID', () => {
			const state = deepFreeze( {
				sites: {
					mediaStorage: {
						fetchingItems: {
							2916284: true,
							77203074: false
						}
					}
				}
			} );

			expect( isRequestingMediaStorage( state, 2916284 ) ).to.eql( true );
			expect( isRequestingMediaStorage( state, 77203074 ) ).to.eql( false );
			expect( isRequestingMediaStorage( state, 'not-defined' ) ).to.eql( false );
		} );
	} );
} );
