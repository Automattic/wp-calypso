/**
 * External dependencies
 */
import assert from 'assert';
import sinon from 'sinon';
import { noop } from 'lodash';
/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import mockedFlows from './fixtures/flows';

describe( 'Signup Flows Configuration', () => {
	describe( 'getFlow', () => {
		let flows, user;

		useFakeDom();
		useFilesystemMocks( __dirname );

		useMockery( ( mockery ) => {
			mockery.registerMock( 'lib/abtest', {
				abtest: noop,
			} );
		} );

		before( () => {
			user = require( 'lib/user' )();

			flows = require( 'signup/config/flows' );
			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
			sinon.stub( flows, 'getABTestFilteredFlow', ( flowName, flow ) => {
				return flow;
			} );
		} );

		it( 'should return the full flow when the user is not logged in', () => {
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'user', 'site' ] );
		} );

		it( 'should remove the user step from the flow when the user is not logged in', () => {
			user.setLoggedIn( true );
			assert.deepEqual( flows.getFlow( 'main' ).steps, [ 'site' ] );
			user.setLoggedIn( false );
		} );
	} );

	describe( 'getABTestFilteredFlow', () => {
		let flows;

		useFakeDom();
		useFilesystemMocks( __dirname );

		const ABTestMock = {
			abtest: noop,
			getABTestVariation: () => {
				return null;
			},
		};

		const getABTestVariationSpy = sinon.stub( ABTestMock, 'getABTestVariation' );

		getABTestVariationSpy.onCall( 0 ).returns( 'notSiteTitle' );
		getABTestVariationSpy.onCall( 1 ).returns( 'notSiteTitle' );
		getABTestVariationSpy.onCall( 2 ).returns( 'showSiteTitleStep' );
		getABTestVariationSpy.onCall( 3 ).returns( 'showSiteTitleStep' );

		useMockery( ( mockery ) => {
			mockery.registerMock( 'lib/abtest', ABTestMock );
		} );

		before( () => {
			flows = require( 'signup/config/flows' );
			sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
			sinon.stub( flows, 'insertStepIntoFlow', ( stepName, flow ) => {
				return flow;
			} );
			sinon.stub( flows, 'removeStepFromFlow', ( stepName, flow ) => {
				return flow;
			} );
		} );

		it( 'should return flow unmodified if not in main flow', () => {
			assert.equal( flows.getABTestFilteredFlow( 'test', 'testflow' ), 'testflow' );
			assert.equal( flows.insertStepIntoFlow.callCount, 0 );
			assert.equal( flows.removeStepFromFlow.callCount, 0 );
		} );

		it( 'should check AB variation in main flow', () => {
			assert.equal( flows.getABTestFilteredFlow( 'main', 'testflow' ), 'testflow' );
			assert.equal( getABTestVariationSpy.callCount, 0 );
			assert.equal( flows.insertStepIntoFlow.callCount, 0 );
		} );

		it( 'should return flow unmodified if variation is not valid', () => {
			const myFlow = {
				name: 'test flow name',
				steps: [ 1, 2, 3 ]
			};

			assert.equal( flows.getABTestFilteredFlow( 'main', myFlow ), myFlow );
			assert.equal( getABTestVariationSpy.callCount, 0 );
			assert.equal( flows.insertStepIntoFlow.callCount, 0 );
		} );
	} );

	describe( 'insertStepIntoFlow', () => {
		let flows;

		useFakeDom();
		useFilesystemMocks( __dirname );

		const myFlow = {
			name: 'test flow name',
			steps: [ 'step1', 'step2', 'step3', 'step4' ]
		};

		Object.freeze( myFlow );

		before( () => {
			flows = require( 'signup/config/flows' );
		} );

		it( 'should return flow unmodified if afterStep is not found', () => {
			const result = flows.insertStepIntoFlow( 'mystep', myFlow, 'test-step' );

			assert.equal( myFlow, result );
			assert.equal( myFlow.steps, result.steps );
		} );

		it( 'should add step at the beginning of flow if afterStep is empty', () => {
			const result = flows.insertStepIntoFlow( 'mystep', myFlow );

			assert.notStrictEqual( myFlow, result );
			assert.notStrictEqual( myFlow.steps, result.steps );
			assert.deepEqual( [ 'mystep', 'step1', 'step2', 'step3', 'step4' ], result.steps );
		} );

		it( 'should insert step after afterStep', () => {
			const result = flows.insertStepIntoFlow( 'mystep', myFlow, 'step2' );

			assert.notStrictEqual( myFlow, result );
			assert.notStrictEqual( myFlow.steps, result.steps );
			assert.deepEqual( [ 'step1', 'step2', 'mystep', 'step3', 'step4' ], result.steps );
		} );
	} );
} );
