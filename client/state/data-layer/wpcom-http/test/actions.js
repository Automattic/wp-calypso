import { http } from '../actions';

const version = 'query.apiVersion';
const namespace = 'query.apiNamespace';

describe( '#http', () => {
	test( 'should set the apiVersion', () => {
		const request = http( { apiVersion: 'v1' } );

		expect( request ).toHaveProperty( version, 'v1' );
		expect( request ).not.toHaveProperty( namespace );
	} );

	test( 'should set the apiNamespace', () => {
		const request = http( { apiNamespace: 'wpcom/v1' } );

		expect( request ).not.toHaveProperty( version );
		expect( request ).toHaveProperty( namespace, 'wpcom/v1' );
	} );

	test( 'should prefer apiNamespace when apiVersion is also given', () => {
		const request = http( { apiVersion: 'v1', apiNamespace: 'wpcom/v1' } );

		expect( request ).not.toHaveProperty( version );
		expect( request ).toHaveProperty( namespace, 'wpcom/v1' );
	} );
} );
