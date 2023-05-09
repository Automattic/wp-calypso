import supertest from 'supertest';

describe( 'api', () => {
	let app;
	let localRequest;

	beforeAll( () => {
		app = require( '../' ).default();
		localRequest = supertest( app );
	} );

	test( 'should return package version', () => {
		const version = require( '../../../package.json' ).version;

		return localRequest.get( '/version' ).then( ( { body, status } ) => {
			expect( status ).toBe( 200 );
			expect( body ).toEqual( { version } );
		} );
	} );
} );
