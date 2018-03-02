/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert'; // eslint-disable-line import/no-nodejs-modules
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import mockedFlows from './fixtures/flows';
import abtest from 'lib/abtest';
import flows from 'signup/config/flows';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => {},
	getABTestVariation: () => null,
} ) );
jest.mock( 'lib/user', () => require( './mocks/lib/user' ) );

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		let user;

		beforeAll( () => {
			user = require( 'lib/user' )();

			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
			sinon.stub( flows, 'getABTestFilteredFlow', ( flowName, flow ) => {
				return flow;
			} );
		} );

		afterAll( () => {
			flows.getFlows.restore();
			flows.getABTestFilteredFlow.restore();
		} );

		test( 'should return the full flow when the user is not logged in', () => {
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
		} );

		test( 'should remove the user step from the flow when the user is not logged in', () => {
			user.setLoggedIn( true );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'site' ] );
			user.setLoggedIn( false );
		} );
	} );

	describe( 'getABTestFilteredFlow', () => {
		const getABTestVariationSpy = sinon.stub( abtest, 'getABTestVariation' );

		getABTestVariationSpy.onCall( 0 ).returns( 'notSiteTitle' );
		getABTestVariationSpy.onCall( 1 ).returns( 'notSiteTitle' );
		getABTestVariationSpy.onCall( 2 ).returns( 'showSiteTitleStep' );
		getABTestVariationSpy.onCall( 3 ).returns( 'showSiteTitleStep' );

		beforeAll( () => {
			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
			sinon.stub( flows, 'insertStepIntoFlow', ( stepName, flow ) => {
				return flow;
			} );
			sinon.stub( flows, 'removeStepFromFlow', ( stepName, flow ) => {
				return flow;
			} );
		} );

		afterAll( () => {
			flows.getFlows.restore();
			flows.insertStepIntoFlow.restore();
			flows.removeStepFromFlow.restore();
		} );

		test( 'should return flow unmodified if not in main flow', () => {
			assert.equal( flows.getABTestFilteredFlow( 'test', 'testflow' ), 'testflow' );
			assert.equal( flows.insertStepIntoFlow.callCount, 0 );
			assert.equal( flows.removeStepFromFlow.callCount, 0 );
		} );

		test( 'should check AB variation in main flow', () => {
			assert.equal( flows.getABTestFilteredFlow( 'main', 'testflow' ), 'testflow' );
			assert.equal( getABTestVariationSpy.callCount, 0 );
			assert.equal( flows.insertStepIntoFlow.callCount, 0 );
		} );

		test( 'should return flow unmodified if variation is not valid', () => {
			const myFlow = {
				name: 'test flow name',
				steps: [ 1, 2, 3 ],
			};

			assert.equal( flows.getABTestFilteredFlow( 'main', myFlow ), myFlow );
			assert.equal( getABTestVariationSpy.callCount, 0 );
			assert.equal( flows.insertStepIntoFlow.callCount, 0 );
		} );
	} );

	describe( 'insertStepIntoFlow', () => {
		const myFlow = {
			name: 'test flow name',
			steps: [ 'step1', 'step2', 'step3', 'step4' ],
		};

		Object.freeze( myFlow );

		test( 'should return flow unmodified if afterStep is not found', () => {
			const result = flows.insertStepIntoFlow( 'mystep', myFlow, 'test-step' );

			assert.equal( myFlow, result );
			assert.equal( myFlow.steps, result.steps );
		} );

		test( 'should add step at the beginning of flow if afterStep is empty', () => {
			const result = flows.insertStepIntoFlow( 'mystep', myFlow );

			assert.notStrictEqual( myFlow, result );
			assert.notStrictEqual( myFlow.steps, result.steps );
			assert.deepEqual( [ 'mystep', 'step1', 'step2', 'step3', 'step4' ], result.steps );
		} );

		test( 'should insert step after afterStep', () => {
			const result = flows.insertStepIntoFlow( 'mystep', myFlow, 'step2' );

			assert.notStrictEqual( myFlow, result );
			assert.notStrictEqual( myFlow.steps, result.steps );
			assert.deepEqual( [ 'step1', 'step2', 'mystep', 'step3', 'step4' ], result.steps );
		} );
	} );
} );
