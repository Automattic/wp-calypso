/**
 * External dependencies
 */
import assert from 'assert';
import keys from 'lodash/keys';
import { intersection, isEmpty, identity } from 'lodash';
import { createStore } from 'redux';

/**
 * Internal dependencies
 */
import useFakeDom from 'test/helpers/use-fake-dom';
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useMockery from 'test/helpers/use-mockery';
import { reducer } from 'state';
import flowsData from 'signup/config/flows-configuration';

describe( 'index', () => {
	let flows, steps;

	useFilesystemMocks( __dirname );
	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', {
			abtest: () => ''
		} );
		flows = require( '../flows' );
		steps = require( '../steps' );
	} );

	it( 'should not have overlapping step/flow names', () => {
		const overlappingNames = intersection( keys( steps ), keys( flows.getFlows() ) );

		if ( ! isEmpty( overlappingNames ) ) {
			throw new Error( 'Step and flow names must be unique. The following names are used as both step and flow names: [' +
				overlappingNames + '].' );
		}
	} );
} );

describe( 'Signup flows configuration validation', () => {
	let FlowController, ProgressStore, DependencyStore, Flows, flowControllerInstance;

	useFakeDom();

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', {
			abtest: identity,
			getABTestVariation: identity,
		} );
		mockery.registerMock( 'lib/signup/step-actions', {} );
	} );

	before( () => {
		ProgressStore = require( 'lib/signup/progress-store' );
		DependencyStore = require( 'lib/signup/dependency-store' );
		FlowController = require( 'lib/signup/flow-controller' );
		Flows = require( 'signup/config/flows' );
		ProgressStore.reset();
		const store = createStore( reducer );
		DependencyStore.setReduxStore( store );


		// temporarily instantiate the FlowController with a valid flow
		flowControllerInstance = FlowController( {
			flowName: 'account'
		} );
	} );

	describe( 'Signup flows configuration validation', () => {
		Object.keys( flowsData ).forEach( ( flowName ) => {
			describe( `Verifying flow "${ flowName }"`, () => {
				afterEach( function() {
					flowControllerInstance.reset();
					DependencyStore.reset();
					ProgressStore.reset();
				} );

				it( 'Valid configuration', () => {
					try {
						flowControllerInstance = FlowController( {
							flowName: flowName,
							onComplete: () => {
								console.log( 'Complete flow' );
							}
						} );
					} catch ( Exception ) {
						/**
						 * We have some steps that require parameters from the HTTP query.
						 * Since at the moment we can't reliably test those, we silently skip them :)
						 */
						if ( ! Exception.message.match( /did not provide the query dependencies/ ) ) {
							throw Exception;
						}
					}
				} );
			} );
		} );
	} );
} );
