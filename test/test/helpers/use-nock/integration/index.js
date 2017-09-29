/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { nock, useNock } from '../index.js';

describe( 'useNock', () => {
	useNock();

	describe( 'Messy without useNock', () => {
		it( 'sets up a persistent interceptor', () => {
			nock( 'wordpress.com' )
				.persist()
				.get( '/me' )
				.reply( 200, { id: 42 } );
		} );
	} );

	describe( 'Illustration Block', () => {
		it( 'still sees the earlier persistent connection', () => {
			expect( nock.isDone() ).to.be.false;
		} );

		afterAll( () => nock.cleanAll() );
	} );

	describe( 'Clean with useNock', () => {
		useNock();

		it( 'sets up a persistent interceptor', () => {
			nock( 'wordpress.com' )
				.persist()
				.get( '/me' )
				.reply( 200, { id: 42 } );

			expect( nock.isDone() ).to.be.false;
		} );

		it( 'persists inside the same `describe` block', () => {
			expect( nock.isDone() ).to.be.false;
		} );
	} );

	describe( 'Test Block', () => {
		it( 'should have reset all remaining nocks', () => {
			expect( nock.isDone() ).to.be.true;
		} );
	} );
} );
