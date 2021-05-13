/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { processInboundChain, processOutboundChain } from '../';

const succeeder = { type: 'SUCCESS' };
const failer = { type: 'FAILURE' };

const getSites = {
	method: 'GET',
	path: '/',
	apiVersion: 'v1',
	onSuccess: succeeder,
	onFailure: failer,
};

describe( '#processInboundChain', () => {
	const aborter = ( inboundData ) => ( {
		...inboundData,
		failures: [],
		shouldAbort: true,
		successes: [],
	} );

	const responderDoubler = ( inboundData ) => ( {
		...inboundData,
		failures: [ ...inboundData.failures, ...inboundData.failures ],
		successes: [ ...inboundData.successes, ...inboundData.successes ],
	} );

	test( 'should pass through data given an empty chain', () => {
		expect(
			processInboundChain( [] )(
				getSites,
				{},
				{ value: 1 },
				{ error: 'bad' },
				{ header: 'foobar' }
			)
		).to.eql( {
			failures: [ getSites.onFailure ],
			nextData: { value: 1 },
			nextError: { error: 'bad' },
			nextHeaders: { header: 'foobar' },
			successes: [ getSites.onSuccess ],
		} );
	} );

	test( 'should sequence a single processor', () => {
		expect( processInboundChain( [ responderDoubler ] )( getSites, {}, {}, {}, {} ) ).to.eql( {
			failures: [ getSites.onFailure, getSites.onFailure ],
			nextData: {},
			nextError: {},
			nextHeaders: {},
			successes: [ getSites.onSuccess, getSites.onSuccess ],
		} );
	} );

	test( 'should sequence multiple processors', () => {
		expect(
			processInboundChain( [ responderDoubler, responderDoubler ] )( getSites, {}, {}, {}, {} )
		).to.eql( {
			failures: new Array( 4 ).fill( getSites.onFailure ),
			nextData: {},
			nextError: {},
			nextHeaders: {},
			successes: new Array( 4 ).fill( getSites.onSuccess ),
		} );
	} );

	test( 'should abort the chain as soon as `shouldAbort` is set', () => {
		expect(
			processInboundChain( [ aborter, responderDoubler ] )( getSites, {}, {}, {}, {} )
		).to.eql( {
			failures: [],
			nextData: {},
			nextError: {},
			nextHeaders: {},
			successes: [],
			shouldAbort: true,
		} );
	} );
} );

describe( '#processOutboundChain', () => {
	const aborter = ( outboundData ) => ( {
		...outboundData,
		nextRequest: null,
	} );

	const pathDoubler = ( outboundData ) => {
		const { nextRequest } = outboundData;
		const { path } = nextRequest;

		return {
			...outboundData,
			nextRequest: {
				...nextRequest,
				path: path + path,
			},
		};
	};

	test( 'should pass requests given an empty chain', () => {
		expect( processOutboundChain( [] )( getSites, {} ) ).to.eql( getSites );
	} );

	test( 'should sequence a single processor', () => {
		expect( processOutboundChain( [ pathDoubler ] )( getSites, {} ) ).to.eql( {
			...getSites,
			path: getSites.path + getSites.path,
		} );
	} );

	test( 'should sequence multiple processors', () => {
		expect( processOutboundChain( [ pathDoubler, pathDoubler ] )( getSites, {} ) ).to.eql( {
			...getSites,
			path: new Array( 4 ).fill( getSites.path ).join( '' ),
		} );
	} );

	test( 'should abort the chain as soon as the `nextRequest` is `null`', () => {
		expect( processOutboundChain( [ aborter, pathDoubler ] )( getSites, {} ) ).to.be.null;
	} );
} );
