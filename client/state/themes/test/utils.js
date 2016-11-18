/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getNormalizedThemesQuery,
	getSerializedThemesQuery,
	getDeserializedThemesQueryDetails,
	getSerializedThemesQueryWithoutPage,
} from '../utils';

describe( 'utils', () => {
	describe( '#getNormalizedThemesQuery()', () => {
		it( 'should exclude default values', () => {
			const query = getNormalizedThemesQuery( {
				page: 4,
				number: 20
			} );

			expect( query ).to.eql( {
				page: 4
			} );
		} );
	} );

	describe( '#getSerializedThemesQuery()', () => {
		it( 'should return a JSON string of a normalized query', () => {
			const serializedQuery = getSerializedThemesQuery( {
				type: 'page',
				page: 1
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedThemesQuery( {
				search: 'Hello'
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );

	describe( 'getDeserializedThemesQueryDetails()', () => {
		it( 'should return undefined query and site if string does not contain JSON', () => {
			const queryDetails = getDeserializedThemesQueryDetails( 'bad' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: undefined
			} );
		} );

		it( 'should return query but not site if string does not contain site prefix', () => {
			const queryDetails = getDeserializedThemesQueryDetails( '{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: undefined,
				query: { search: 'hello' }
			} );
		} );

		it( 'should return query and site if string contains site prefix and JSON', () => {
			const queryDetails = getDeserializedThemesQueryDetails( '2916284:{"search":"hello"}' );

			expect( queryDetails ).to.eql( {
				siteId: 2916284,
				query: { search: 'hello' }
			} );
		} );
	} );

	describe( '#getSerializedThemesQueryWithoutPage()', () => {
		it( 'should return a JSON string of a normalized query omitting page', () => {
			const serializedQuery = getSerializedThemesQueryWithoutPage( {
				type: 'page',
				page: 2
			} );

			expect( serializedQuery ).to.equal( '{"type":"page"}' );
		} );

		it( 'should prefix site ID if specified', () => {
			const serializedQuery = getSerializedThemesQueryWithoutPage( {
				search: 'Hello',
				page: 2
			}, 2916284 );

			expect( serializedQuery ).to.equal( '2916284:{"search":"Hello"}' );
		} );
	} );
} );
