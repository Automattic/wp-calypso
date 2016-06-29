/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { createStoredCardsArray } from '../assembler.js';
import { STORED_CARDS_FROM_API, STORED_CARDS } from './fixture';

describe( 'assembler', () => {
	it( 'should be a function', () => {
		expect( createStoredCardsArray ).to.be.an( 'function' );
	} );

	it( 'should return an empty array when data transfer object is undefined', () => {
		expect( createStoredCardsArray() ).to.be.eql( [] );
	} );

	it( 'should return an empty array when data transfer object is null', () => {
		expect( createStoredCardsArray( null ) ).to.be.eql( [] );
	} );

	it( 'should convert the data transfer object to the right data structure', () => {
		expect( createStoredCardsArray( STORED_CARDS_FROM_API ) ).to.be.eql( STORED_CARDS );
	} );
} );
