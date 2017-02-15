/**
 * External dependencies
 */
import { expect } from 'chai';

import {
	processEgressChain,
	processIngressChain,
} from '../';

const succeeder = { type: 'SUCCESS' };
const failer = { type: 'FAILURE' };

const getSites = {
	method: 'GET',
	path: '/',
	apiVersion: 'v1',
	onSuccess: succeeder,
	onFailure: failer,
};

describe( '#processEgressChain', () => {
	const aborter = egressData => ( {
		...egressData,
		failures: [],
		shouldAbort: true,
		successes: [],
	} );

	const responderDoubler = egressData => ( {
		...egressData,
		failures: [ ...egressData.failures, ...egressData.failures ],
		successes: [ ...egressData.successes, ...egressData.successes ],
	} );

	it( 'should pass through data given an empty chain', () => {
		expect(
			processEgressChain( [] )( getSites, {}, { value: 1 }, { error: 'bad' } )
		).to.eql( {
			failures: [ getSites.onFailure ],
			nextData: { value: 1 },
			nextError: { error: 'bad' },
			successes: [ getSites.onSuccess ],
		} );
	} );

	it( 'should sequence a single processor', () => {
		expect(
			processEgressChain( [ responderDoubler ] )( getSites, {}, {}, {} )
		).to.eql( {
			failures: [ getSites.onFailure, getSites.onFailure ],
			nextData: {},
			nextError: {},
			successes: [ getSites.onSuccess, getSites.onSuccess ],
		} );
	} );

	it( 'should sequence multiple processors', () => {
		expect(
			processEgressChain( [ responderDoubler, responderDoubler ] )( getSites, {}, {}, {} )
		).to.eql( {
			failures: ( new Array( 4 ) ).fill( getSites.onFailure ),
			nextData: {},
			nextError: {},
			successes: ( new Array( 4 ) ).fill( getSites.onSuccess ),
		} );
	} );

	it( 'should abort the chain as soon as `shouldAbort` is set', () => {
		expect(
			processEgressChain( [ aborter, responderDoubler ] )( getSites, {}, {}, {} )
		).to.eql( {
			failures: [],
			nextData: {},
			nextError: {},
			successes: [],
			shouldAbort: true,
		} );
	} );
} );

describe( '#processIngressChain', () => {
	const aborter = ingressData => ( {
		...ingressData,
		nextRequest: null,
	} );

	const pathDoubler = ingressData => {
		const { nextRequest } = ingressData;
		const { path } = nextRequest;

		return {
			...ingressData,
			nextRequest: {
				...nextRequest,
				path: path + path,
			}
		};
	};

	it( 'should pass requests given an empty chain', () => {
		expect( processIngressChain( [] )( getSites, {} ) ).to.eql( getSites );
	} );

	it( 'should sequence a single processor', () => {
		expect( processIngressChain( [ pathDoubler ] )( getSites, {} ) ).to.eql( {
			...getSites,
			path: getSites.path + getSites.path,
		} );
	} );

	it( 'should sequence multiple processors', () => {
		expect( processIngressChain( [ pathDoubler, pathDoubler ] )( getSites, {} ) ).to.eql( {
			...getSites,
			path: ( new Array( 4 ) ).fill( getSites.path ).join( '' ),
		} );
	} );

	it( 'should abort the chain as soon as the `nextRequest` is `null`', () => {
		expect( processIngressChain( [ aborter, pathDoubler ] )( getSites, {} ) ).to.be.null;
	} );
} );
