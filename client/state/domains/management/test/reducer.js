import { get, reduce } from 'lodash';
import {
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
} from 'calypso/state/action-types';
import reducer, { items } from '../reducer';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( Object.keys( reducer( undefined, {} ) ) ).toEqual(
			expect.arrayContaining( [
				'items',
				'isRequestingContactDetailsCache',
				'isRequestingWhois',
				'isSaving',
			] )
		);
	} );

	describe( '#items()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state._contactDetailsCache ).toBeUndefined();
		} );

		describe( 'Receive extra', () => {
			test( 'should overwrite previous data', () => {
				const preexistingData = {
					firstName: 'Cronus',
					organization: 'titans',
				};

				const newData = {
					firstName: 'Zeus',
					extra: {
						registrantType: 'individual',
					},
				};

				const state = items( preexistingData, {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
					data: newData,
				} );

				expect( state ).toHaveProperty( '_contactDetailsCache', newData );
			} );

			test( "should ignore an extra if it's an array", () => {
				const state = items(
					{},
					{
						type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
						data: { firstName: 'New', extra: [ '' ] },
					}
				);

				expect( Array.isArray( get( state, [ '_contactDetailsCache', 'extra' ] ) ) ).toBe( false );
			} );

			test( 'should take other fields if extra is corrupt', () => {
				const preexistingData = { firstName: 'Hera' };
				const state = items( preexistingData, {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
					data: { firstName: 'New', extra: [ '' ] },
				} );

				expect( state._contactDetailsCache ).toHaveProperty( 'firstName', 'New' );
			} );
		} );

		describe( 'Update extra', () => {
			test( 'should add new values', () => {
				const newData = {
					extra: {
						testAdd: 'testAddValue',
					},
				};

				const state = items(
					{},
					{
						type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
						data: newData,
					}
				);

				expect( state._contactDetailsCache ).toEqual( newData );
			} );

			test( 'should preserve existing values', () => {
				const firstData = {
					extra: {
						testPreserve: "I'm still here",
					},
				};
				const secondData = {
					extra: {
						additionalField: 'second',
					},
				};

				const intermediateState = items(
					{},
					{
						type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
						data: firstData,
					}
				);

				const finalState = items( intermediateState, {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
					data: secondData,
				} );

				expect( finalState._contactDetailsCache ).toHaveProperty(
					'extra.testPreserve',
					"I'm still here"
				);
			} );

			test( 'should update existing values', () => {
				const firstData = {
					extra: {
						testUpdate: 'old',
					},
				};
				const secondData = {
					extra: {
						testUpdate: 'new',
					},
				};

				const intermediateState = items(
					{},
					{
						type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
						data: firstData,
					}
				);

				const finalState = items( intermediateState, {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
					data: secondData,
				} );

				expect( finalState._contactDetailsCache ).toHaveProperty( 'extra.testUpdate', 'new' );
			} );

			test( 'should handle corrupt values', () => {
				const initialState = {};

				const dataSequence = [
					{ before: "I'm still standing" },
					[ '' ],
					{ after: 'better than I ever did' },
				];

				const state = reduce(
					dataSequence,
					( intermediateState, data ) =>
						items( intermediateState, {
							type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
							data: { extra: data },
						} ),
					initialState
				);

				expect( state._contactDetailsCache ).toHaveProperty(
					'extra',
					expect.objectContaining( {
						before: "I'm still standing",
						after: 'better than I ever did',
					} )
				);
			} );

			test( 'should replace an existing corrupt value', () => {
				const corruptExistingData = {
					_contactDetailsCache: {
						extra: [ '' ],
					},
				};

				const newData = {
					extra: {
						newData: 'exists',
					},
				};

				const result = items( corruptExistingData, {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
					data: newData,
				} );

				expect( Array.isArray( result._contactDetailsCache ) ).toBe( false );

				expect( result._contactDetailsCache ).toHaveProperty( 'extra.newData', 'exists' );
			} );
		} );
	} );
} );
