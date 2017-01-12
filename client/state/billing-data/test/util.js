/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { parseDate } from '../util';

describe( 'util', () => {
	describe( '#parseDate()', () => {
		const transaction = deepFreeze( {
			id: 123456,
			date: '2016-12-12T11:22:33+0000'
		} );

		it( 'should parse the date of the transaction', () => {
			const updatedTransaction = parseDate( transaction );

			expect( updatedTransaction ).to.eql( {
				id: 123456,
				date: new Date( transaction.date )
			} );
		} );
	} );
} );
