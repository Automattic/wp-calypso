/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSubscribedLists,
	getSubscribedLists
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingSubscribedLists()', () => {
		it( 'should return false if not fetching', () => {
			const isRequesting = isRequestingSubscribedLists( {
				reader: {
					lists: {
						isRequesting: false
					}
				}
			} );

			expect( isRequesting ).to.be.false;
		} );

		it( 'should return true if fetching', () => {
			const isRequesting = isRequestingSubscribedLists( {
				reader: {
					lists: {
						isRequesting: true
					}
				}
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getSubscribedLists()', () => {
		it( 'should return an empty array if the user is not subscribed to any lists', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas'
							}
						},
						subscribedLists: []
					}
				}
			} );

			expect( subscribedLists ).to.eql( [] );
		} );

		it( 'should return an empty array if the user is not subscribed to any lists', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas'
							}
						},
						subscribedLists: [ 123, 456 ]
					}
				}
			} );

			expect( subscribedLists ).to.eql( [ { ID: 123, slug: 'bananas' } ] );
		} );
	} );
} );
