import { nock, useNock } from '../index.js';

describe( 'useNock', () => {
	useNock();

	describe( 'Messy without useNock', () => {
		// eslint-disable-next-line jest/expect-expect
		test( 'sets up a persistent interceptor', () => {
			nock( 'wordpress.com' ).persist().get( '/me' ).reply( 200, { id: 42 } );
		} );
	} );

	describe( 'Illustration Block', () => {
		test( 'still sees the earlier persistent connection', () => {
			expect( nock.isDone() ).toBe( false );
		} );

		afterAll( () => nock.cleanAll() );
	} );

	describe( 'Clean with useNock', () => {
		useNock();

		test( 'sets up a persistent interceptor', () => {
			nock( 'wordpress.com' ).persist().get( '/me' ).reply( 200, { id: 42 } );

			expect( nock.isDone() ).toBe( false );
		} );

		test( 'persists inside the same `describe` block', () => {
			expect( nock.isDone() ).toBe( false );
		} );
	} );

	describe( 'Test Block', () => {
		test( 'should have reset all remaining nocks', () => {
			expect( nock.isDone() ).toBe( true );
		} );
	} );
} );
