/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSiteUpdates,
	getUpdatesBySiteId
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingSiteUpdates()', () => {
		it( 'should return false if site updates have not been fetched yet', () => {
			const isRequesting = isRequestingSiteUpdates( {
				sites: {
					updates: {
						requesting: {}
					}
				}
			}, 12345678 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return false if the site updates are not being requested', () => {
			const isRequesting = isRequestingSiteUpdates( {
				sites: {
					updates: {
						requesting: {
							12345678: false
						}
					}
				}
			}, 12345678 );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if the site updates are being requested', () => {
			const isRequesting = isRequestingSiteUpdates( {
				sites: {
					updates: {
						requesting: {
							12345678: true
						}
					}
				}
			}, 12345678 );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getUpdatesBySiteId()', () => {
		it( 'should return null if site updates have not been fetched yet', () => {
			const updates = getUpdatesBySiteId( {
				sites: {
					updates: {
						items: {}
					}
				}
			}, 12345678 );

			expect( updates ).to.be.null;
		} );

		it( 'should return the updates for an existing site', () => {
			const exampleUpdates = {
				plugins: 1,
				total: 1,
			};
			const updates = getUpdatesBySiteId( {
				sites: {
					updates: {
						items: {
							12345678: exampleUpdates
						}
					}
				}
			}, 12345678 );

			expect( updates ).to.eql( exampleUpdates );
		} );
	} );
} );
