/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingSubscribedLists,
	getSubscribedLists,
	getListByOwnerAndSlug
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

		it( 'should retrieve items in a-z slug order', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas'
							},
							456: {
								ID: 456,
								slug: 'ants'
							}
						},
						subscribedLists: [ 123, 456 ]
					}
				}
			} );

			expect( subscribedLists ).to.eql( [
				{ ID: 456, slug: 'ants'},
				{ ID: 123, slug: 'bananas' }
			] );
		} );
	} );

	describe( '#getListByOwnerAndSlug()', () => {
		it( 'should return undefined if the list does not exist', () => {
			const list = getListByOwnerAndSlug( {
				reader: {
					lists: {}
				}
			}, 'restapitests', 'bananas' );

			expect( list ).to.eql( undefined );
		} );

		it( 'should return a list if the owner and slug match', () => {
			const list = getListByOwnerAndSlug( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								owner: 'restapitests',
								slug: 'bananas'
							},
							456: {
								ID: 456,
								owner: 'restapitests',
								slug: 'ants'
							}
						}
					}
				}
			}, 'restapitests', 'bananas' );

			expect( list ).to.eql( {
				ID: 123,
				owner: 'restapitests',
				slug: 'bananas'
			} );
		} );
	} );
} );
