/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingList,
	isRequestingSubscribedLists,
	getSubscribedLists,
	isUpdatedList,
	getListByOwnerAndSlug,
	isSubscribedByOwnerAndSlug,
	hasError,
	isMissingByOwnerAndSlug,
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingList()', () => {
		test( 'should return false if not fetching', () => {
			const isRequesting = isRequestingList( {
				reader: {
					lists: {
						isRequestingList: false,
					},
				},
			} );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if fetching', () => {
			const isRequesting = isRequestingList( {
				reader: {
					lists: {
						isRequestingList: true,
					},
				},
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#isRequestingSubscribedLists()', () => {
		test( 'should return false if not fetching', () => {
			const isRequesting = isRequestingSubscribedLists( {
				reader: {
					lists: {
						isRequestingLists: false,
					},
				},
			} );

			expect( isRequesting ).to.be.false;
		} );

		test( 'should return true if fetching', () => {
			const isRequesting = isRequestingSubscribedLists( {
				reader: {
					lists: {
						isRequestingLists: true,
					},
				},
			} );

			expect( isRequesting ).to.be.true;
		} );
	} );

	describe( '#getSubscribedLists()', () => {
		test( 'should return an empty array if the user is not subscribed to any lists', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas',
							},
						},
						subscribedLists: [],
					},
				},
			} );

			expect( subscribedLists ).to.eql( [] );
		} );

		test( 'should retrieve items in a-z slug order', () => {
			const subscribedLists = getSubscribedLists( {
				reader: {
					lists: {
						items: {
							123: {
								ID: 123,
								slug: 'bananas',
							},
							456: {
								ID: 456,
								slug: 'ants',
							},
						},
						subscribedLists: [ 123, 456 ],
					},
				},
			} );

			expect( subscribedLists ).to.eql( [
				{ ID: 456, slug: 'ants' },
				{ ID: 123, slug: 'bananas' },
			] );
		} );
	} );

	describe( '#isUpdatedList()', () => {
		test( 'should return false if list has not been updated', () => {
			const isUpdated = isUpdatedList(
				{
					reader: {
						lists: {
							updatedLists: [],
						},
					},
				},
				123
			);

			expect( isUpdated ).to.be.false;
		} );

		test( 'should return true if the list has been updated', () => {
			const isUpdated = isUpdatedList(
				{
					reader: {
						lists: {
							updatedLists: [ 123, 456 ],
						},
					},
				},
				123
			);

			expect( isUpdated ).to.be.true;
		} );
	} );

	describe( '#getListByOwnerAndSlug()', () => {
		test( 'should return undefined if the list does not exist', () => {
			const list = getListByOwnerAndSlug(
				{
					reader: {
						lists: {},
					},
				},
				'lister',
				'bananas'
			);

			expect( list ).to.eql( undefined );
		} );

		test( 'should return a list if the owner and slug match', () => {
			const list = getListByOwnerAndSlug(
				{
					reader: {
						lists: {
							items: {
								123: {
									ID: 123,
									owner: 'lister',
									slug: 'bananas',
								},
								456: {
									ID: 456,
									owner: 'lister',
									slug: 'ants',
								},
							},
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( list ).to.eql( {
				ID: 123,
				owner: 'lister',
				slug: 'bananas',
			} );
		} );
	} );

	describe( '#isSubscribedByOwnerAndSlug()', () => {
		test( 'should return false if the list does not exist', () => {
			const isSubscribed = isSubscribedByOwnerAndSlug(
				{
					reader: {
						lists: {},
						subscribedLists: [],
					},
				},
				'lister',
				'bananas'
			);

			expect( isSubscribed ).to.eql( false );
		} );

		test( 'should return true if the owner and slug match a subscribed list', () => {
			const isSubscribed = isSubscribedByOwnerAndSlug(
				{
					reader: {
						lists: {
							items: {
								123: {
									ID: 123,
									owner: 'lister',
									slug: 'bananas',
								},
								456: {
									ID: 456,
									owner: 'lister',
									slug: 'ants',
								},
							},
							subscribedLists: [ 123 ],
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( isSubscribed ).to.eql( true );
		} );
	} );

	describe( '#hasError()', () => {
		test( 'should return false if there is no error for the list', () => {
			const result = hasError(
				{
					reader: {
						lists: {
							errors: { 123: 400 },
						},
					},
				},
				456
			);

			expect( result ).to.be.false;
		} );

		test( 'should return true if the list has an error', () => {
			const result = hasError(
				{
					reader: {
						lists: {
							errors: { 123: 400 },
						},
					},
				},
				123
			);

			expect( result ).to.be.true;
		} );
	} );

	describe( '#isMissingByOwnerAndSlug()', () => {
		test( 'should return false if the missing list does not exist', () => {
			const isMissing = isMissingByOwnerAndSlug(
				{
					reader: {
						lists: {
							missingLists: [],
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( isMissing ).to.eql( false );
		} );

		test( 'should return true if the owner and slug match a missing list', () => {
			const isMissing = isMissingByOwnerAndSlug(
				{
					reader: {
						lists: {
							missingLists: [ { owner: 'lister', slug: 'bananas' } ],
						},
					},
				},
				'lister',
				'bananas'
			);

			expect( isMissing ).to.eql( true );
		} );
	} );
} );
