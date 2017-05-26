/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import queueOperation from '../';

describe.only( 'queueOperation', () => {
	it( 'should process only one operation at a time', () => {
		const myQueueKey = 'hello';
		const operation1 = spy( () => {
			return new Promise( resolve => {
				setTimeout( resolve, 100 );
			} );
		} );

		const operation2 = spy( () => {
			return new Promise( resolve => {
				setTimeout( resolve, 0 );
			} );
		} );

		const operation1Promise = queueOperation( myQueueKey, operation1 )
			.then( () => {
				expect( operation1 ).to.be.called;
				expect( operation2 ).not.to.be.called;
			} );

		const operation2Promise = queueOperation( myQueueKey, operation2 ).then( () => {
			expect( operation2 ).to.be.called;
		} );

		return Promise.all( [ operation1Promise, operation2Promise ] );
	} );

	it( 'should throw if operation is not a function', () => {
		expect( () => queueOperation( 'hello', 'world' ) ).to.throw( /Provided operation must be a function/ );
	} );

	it( 'should be concurrent between queue keys', () => {
		const operation1 = spy( () => new Promise( resolve => resolve() ) );
		const operation2 = spy( () => new Promise( resolve => resolve() ) );

		queueOperation( 'hello', operation1 );
		queueOperation( 'world', operation2 );

		expect( operation1 ).to.be.called;
		expect( operation2 ).to.be.called;
	} );
} );
