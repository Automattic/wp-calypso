/**
 * External dependencies
 */
import { expect } from 'chai';
import { get, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import reducer, { items } from '../reducer';
import {
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
	DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_UPDATE,
} from 'state/action-types';

describe( 'reducer', () => {
	test( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'isRequestingContactDetailsCache',
			'isRequestingWhois',
			'isSaving',
			'validationSchemas',
		] );
	} );

	describe( '#items()', () => {
		test( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state._contactDetailsCache ).to.be.undefined;
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

				expect( state ).to.have.property( '_contactDetailsCache', newData );
			} );

			test( "should ignore an extra if it's an array", () => {
				const state = items(
					{},
					{
						type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
						data: { firstName: 'New', extra: [ '' ] },
					}
				);

				expect( get( state, [ '_contactDetailsCache', 'extra' ] ) ).to.not.be.an( 'array' );
			} );

			test( 'should take other fields if extra is corrupt', () => {
				const preexistingData = { firstName: 'Hera' };
				const state = items( preexistingData, {
					type: DOMAIN_MANAGEMENT_CONTACT_DETAILS_CACHE_RECEIVE,
					data: { firstName: 'New', extra: [ '' ] },
				} );

				expect( state._contactDetailsCache ).to.have.property( 'firstName', 'New' );
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

				expect( state._contactDetailsCache ).to.eql( newData );
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

				expect( finalState._contactDetailsCache ).to.have.nested.property(
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

				expect( finalState._contactDetailsCache ).to.have.nested.property(
					'extra.testUpdate',
					'new'
				);
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

				expect( state._contactDetailsCache )
					.to.have.property( 'extra' )
					.that.is.an( 'object' )
					.with.all.keys( {
						before: "I'm still standing",
						after: 'better than I ever did',
					} );
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

				expect( result._contactDetailsCache ).to.have.property( 'extra' ).that.is.not.an( 'array' );

				expect( result._contactDetailsCache ).to.have.nested.property( 'extra.newData', 'exists' );
			} );
		} );
	} );
} );
