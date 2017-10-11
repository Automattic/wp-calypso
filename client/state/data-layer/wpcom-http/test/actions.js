/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { http } from '../actions';

const version = 'query.apiVersion';
const namespace = 'query.apiNamespace';

describe( '#http', () => {
	test( 'should set the apiVersion', () => {
		const request = http( { apiVersion: 'v1' } );

		expect( request ).to.have.deep.property( version, 'v1' );
		expect( request ).to.not.have.deep.property( namespace );
	} );

	test( 'should set the apiNamespace', () => {
		const request = http( { apiNamespace: 'wpcom/v1' } );

		expect( request ).to.not.have.deep.property( version );
		expect( request ).to.have.deep.property( namespace, 'wpcom/v1' );
	} );

	test( 'should prefer apiNamespace when apiVersion is also given', () => {
		const request = http( { apiVersion: 'v1', apiNamespace: 'wpcom/v1' } );

		expect( request ).to.not.have.deep.property( version );
		expect( request ).to.have.deep.property( namespace, 'wpcom/v1' );
	} );
} );
