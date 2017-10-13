/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import assert from 'assert';
import debugModule from 'debug';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import utils from '../utils';
import mockedFlows from './fixtures/flows';
import flows from 'signup/config/flows';

jest.mock( 'lib/abtest', () => ( {
	abtest: () => '',
} ) );
jest.mock( 'lib/user', () => () => ( {
	get: () => {},
} ) );

/**
 * Module variables
 */
const debug = debugModule( 'calypso:client:signup:controller-utils:test' );

debug( 'start utils test' );

describe( 'utils', () => {
	beforeAll( () => {
		sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
		sinon.stub( flows, 'preloadABTestVariationsForStep', () => {} );
		sinon.stub( flows, 'getABTestFilteredFlow', ( flowName, flow ) => {
			return flow;
		} );
	} );

	describe( 'getLocale', () => {
		test( 'should find the locale anywhere in the params', () => {
			assert.equal( utils.getLocale( { lang: 'fr' } ), 'fr' );
			assert.equal( utils.getLocale( { stepName: 'fr' } ), 'fr' );
			assert.equal( utils.getLocale( { flowName: 'fr' } ), 'fr' );
		} );

		test( 'should return undefined if no locale is present in the params', () => {
			assert.equal(
				utils.getLocale( {
					stepName: 'theme-selection',
					flowName: 'flow-one',
				} ),
				undefined
			);
		} );
	} );

	describe( 'getStepName', () => {
		test( 'should find the step name in either the stepName or flowName fragment', () => {
			assert.equal( utils.getStepName( { stepName: 'user' } ), 'user' );
			assert.equal( utils.getStepName( { flowName: 'user' } ), 'user' );
		} );

		test( 'should return undefined if no step name is found', () => {
			assert.equal( utils.getStepName( { flowName: 'account' } ), undefined );
		} );
	} );

	describe( 'getFlowName', () => {
		afterEach( () => {
			flows.filterFlowName = null;
		} );

		test( 'should find the flow name in the flowName fragment if present', () => {
			assert.equal( utils.getFlowName( { flowName: 'other' } ), 'other' );
		} );

		test( 'should return the default flow if the flow is missing', () => {
			assert.equal( utils.getFlowName( {} ), 'main' );
		} );

		test( 'should return the result of filterFlowName if it is a function and the flow is missing', () => {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			assert.equal( utils.getFlowName( {} ), 'filtered' );
		} );

		test( 'should return the result of filterFlowName if it is a function and the flow is not valid', () => {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			assert.equal( utils.getFlowName( { flowName: 'invalid' } ), 'filtered' );
		} );

		test( 'should return the result of filterFlowName if it is a function and the requested flow is present', () => {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			assert.equal( utils.getFlowName( { flowName: 'other' } ), 'filtered' );
		} );

		test( 'should return the passed flow if the result of filterFlowName is not valid', () => {
			flows.filterFlowName = sinon.stub().returns( 'foobar' );
			assert.equal( utils.getFlowName( { flowName: 'other' } ), 'other' );
		} );

		test( 'should call filterFlowName with the default flow if it is a function and the flow is not valid', () => {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			utils.getFlowName( { flowName: 'invalid' } );
			assert( flows.filterFlowName.calledWith( 'main' ) );
		} );

		test( 'should call filterFlowName with the requested flow if it is a function and the flow is valid', () => {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			utils.getFlowName( { flowName: 'other' } );
			assert( flows.filterFlowName.calledWith( 'other' ) );
		} );
	} );

	describe( 'getValidPath', () => {
		test( 'should redirect to the default if no flow is present', () => {
			assert.equal( utils.getValidPath( {} ), '/start/user' );
		} );

		test( 'should redirect to the current flow default if no step is present', () => {
			assert.equal( utils.getValidPath( { flowName: 'account' } ), '/start/account/user' );
		} );

		test( 'should redirect to the default flow if the flow is the default', () => {
			assert.equal( utils.getValidPath( { flowName: 'main' } ), '/start/user' );
		} );

		test( 'should redirect invalid steps to the default flow if no flow is present', () => {
			assert.equal(
				utils.getValidPath( {
					stepName: 'fr',
					stepSectionName: 'fr',
				} ),
				'/start/user/fr'
			);
		} );

		test( 'should preserve a valid locale to the default flow if one is specified', () => {
			assert.equal(
				utils.getValidPath( {
					stepName: 'fr',
					stepSectionName: 'abc',
				} ),
				'/start/user/abc/fr'
			);
		} );

		test( 'should redirect invalid steps to the current flow default', () => {
			assert.equal(
				utils.getValidPath( {
					flowName: 'account',
					stepName: 'fr',
					stepSectionName: 'fr',
				} ),
				'/start/account/user/fr'
			);
		} );

		test( 'should preserve a valid locale if one is specified', () => {
			assert.equal(
				utils.getValidPath( {
					flowName: 'account',
					stepName: 'fr',
					stepSectionName: 'abc',
				} ),
				'/start/account/user/abc/fr'
			);
		} );

		test( 'should handle arbitrary step section names', () => {
			const randomStepSectionName = 'random-step-section-' + Math.random();

			assert.equal(
				utils.getValidPath( {
					flowName: 'account',
					stepName: 'user',
					stepSectionName: randomStepSectionName,
					lang: 'fr',
				} ),
				'/start/account/user/' + randomStepSectionName + '/fr'
			);
		} );

		test( 'should handle arbitrary step section names in the default flow', () => {
			const randomStepSectionName = 'random-step-section-' + Math.random();

			assert.equal(
				utils.getValidPath( {
					stepName: 'user',
					stepSectionName: randomStepSectionName,
					lang: 'fr',
				} ),
				'/start/user/' + randomStepSectionName + '/fr'
			);
		} );
	} );

	describe( 'getValueFromProgressStore', () => {
		const signupProgress = [ { stepName: 'empty' }, { stepName: 'site', site: 'calypso' } ];
		const config = {
			stepName: 'site',
			fieldName: 'site',
			signupProgress,
		};

		test( 'should return the value of the field if it exists', () => {
			assert.equal( utils.getValueFromProgressStore( config ), 'calypso' );
		} );

		test( 'should return null if the field is not present', () => {
			delete signupProgress[ 1 ].site;
			assert.equal( utils.getValueFromProgressStore( config ), null );
		} );
	} );

	describe( 'mergeFormWithValue', () => {
		const config = {
			fieldName: 'username',
			fieldValue: 'calypso',
		};

		test( "should return the form with the field added if the field doesn't have a value", () => {
			const form = { username: {} };
			config.form = form;
			assert.deepEqual( utils.mergeFormWithValue( config ), {
				username: { value: 'calypso' },
			} );
		} );

		test( 'should return the form unchanged if there is already a value in the form', () => {
			const form = { username: { value: 'wordpress' } };
			config.form = form;
			assert.equal( utils.mergeFormWithValue( config ), form );
		} );
	} );
} );
