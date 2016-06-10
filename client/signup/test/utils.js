/**
 * External dependencies
 */
import debugModule from 'debug';
import sinon from 'sinon';
import assert from 'assert';

/**
 * Internal dependencies
 */
import useFilesystemMocks from 'test/helpers/use-filesystem-mocks';
import useMockery from 'test/helpers/use-mockery';
import useFakeDom from 'test/helpers/use-fake-dom';
import mockedFlows from './fixtures/flows';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:client:signup:controller-utils:test' );

debug( 'start utils test' );

describe( 'utils', function() {
	let flows, utils;

	useFilesystemMocks( __dirname );
	useFakeDom();

	useMockery( ( mockery ) => {
		mockery.registerMock( 'lib/abtest', {
			abtest: () => ''
		} );
	} );

	before( () => {
		flows = require( 'signup/config/flows' );
		sinon.stub( flows, 'getFlows' ).returns( mockedFlows );
		utils = require( '../utils' );
	} );

	describe( 'getLocale', function() {
		it( 'should find the locale anywhere in the params', function() {
			assert.equal( utils.getLocale( { lang: 'fr' } ), 'fr' );
			assert.equal( utils.getLocale( { stepName: 'fr' } ), 'fr' );
			assert.equal( utils.getLocale( { flowName: 'fr' } ), 'fr' );
		} );

		it( 'should return undefined if no locale is present in the params', function() {
			assert.equal( utils.getLocale( {
				stepName: 'theme-selection',
				flowName: 'flow-one'
			} ), undefined );
		} );
	} );

	describe( 'getStepName', function() {
		it( 'should find the step name in either the stepName or flowName fragment', function() {
			assert.equal( utils.getStepName( { stepName: 'user' } ), 'user' );
			assert.equal( utils.getStepName( { flowName: 'user' } ), 'user' );
		} );

		it( 'should return undefined if no step name is found', function() {
			assert.equal( utils.getStepName( { flowName: 'account' } ), undefined );
		} );
	} );

	describe( 'getFlowName', function() {
		afterEach( function() {
			flows.filterFlowName = null;
		} );

		it( 'should find the flow name in the flowName fragment if present', function() {
			assert.equal( utils.getFlowName( { flowName: 'other' } ), 'other' );
		} );

		it( 'should return the default flow if the flow is missing', function() {
			assert.equal( utils.getFlowName( {} ), 'main' );
		} );

		it( 'should return the result of filterFlowName if it is a function and the flow is missing', function() {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			assert.equal( utils.getFlowName( {} ), 'filtered' );
		} );

		it( 'should return the result of filterFlowName if it is a function and the flow is not valid', function() {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			assert.equal( utils.getFlowName( { flowName: 'invalid' } ), 'filtered' );
		} );

		it( 'should return the result of filterFlowName if it is a function and the requested flow is present', function() {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			assert.equal( utils.getFlowName( { flowName: 'other' } ), 'filtered' );
		} );

		it( 'should return the passed flow if the result of filterFlowName is not valid', function() {
			flows.filterFlowName = sinon.stub().returns( 'foobar' );
			assert.equal( utils.getFlowName( { flowName: 'other' } ), 'other' );
		} );

		it( 'should call filterFlowName with the default flow if it is a function and the flow is not valid', function() {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			utils.getFlowName( { flowName: 'invalid' } );
			assert( flows.filterFlowName.calledWith( 'main' ) );
		} );

		it( 'should call filterFlowName with the requested flow if it is a function and the flow is valid', function() {
			flows.filterFlowName = sinon.stub().returns( 'filtered' );
			utils.getFlowName( { flowName: 'other' } );
			assert( flows.filterFlowName.calledWith( 'other' ) );
		} );
	} );

	describe( 'getValidPath', function() {
		it( 'should redirect to the default if no flow is present', function() {
			assert.equal( utils.getValidPath( {} ), '/start/user' );
		} );

		it( 'should redirect to the current flow default if no step is present', function() {
			assert.equal( utils.getValidPath( { flowName: 'account' } ), '/start/account/user' );
		} );

		it( 'should redirect to the default flow if the flow is the default', function() {
			assert.equal( utils.getValidPath( { flowName: 'main' } ), '/start/user' );
		} );

		it( 'should redirect invalid steps to the default flow if no flow is present', function() {
			assert.equal( utils.getValidPath( {
				stepName: 'fr',
				stepSectionName: 'fr'
			} ), '/start/user/fr' );
		} );

		it( 'should preserve a valid locale to the default flow if one is specified', function() {
			assert.equal( utils.getValidPath( {
				stepName: 'fr',
				stepSectionName: 'abc'
			} ), '/start/user/abc/fr' );
		} );

		it( 'should redirect invalid steps to the current flow default', function() {
			assert.equal( utils.getValidPath( {
				flowName: 'account',
				stepName: 'fr',
				stepSectionName: 'fr'
			} ), '/start/account/user/fr' );
		} );

		it( 'should preserve a valid locale if one is specified', function() {
			assert.equal( utils.getValidPath( {
				flowName: 'account',
				stepName: 'fr',
				stepSectionName: 'abc'
			} ), '/start/account/user/abc/fr' );
		} );

		it( 'should handle arbitrary step section names', function() {
			const randomStepSectionName = 'random-step-section-' + Math.random();

			assert.equal( utils.getValidPath( {
				flowName: 'account',
				stepName: 'user',
				stepSectionName: randomStepSectionName,
				lang: 'fr'
			} ), '/start/account/user/' + randomStepSectionName + '/fr' );
		} );

		it( 'should handle arbitrary step section names in the default flow', function() {
			const randomStepSectionName = 'random-step-section-' + Math.random();

			assert.equal( utils.getValidPath( {
				stepName: 'user',
				stepSectionName: randomStepSectionName,
				lang: 'fr'
			} ), '/start/user/' + randomStepSectionName + '/fr' );
		} );
	} );

	describe( 'getValueFromProgressStore', function() {
		const testStore = [ { stepName: 'empty' }, { stepName: 'site', site: 'calypso' } ];
		const config = {
			stepName: 'site',
			fieldName: 'site',
			signupProgressStore: testStore
		};

		it( 'should return the value of the field if it exists', function() {
			assert.equal( utils.getValueFromProgressStore( config ), 'calypso' );
		} );

		it( 'should return null if the field is not present', function() {
			delete testStore[ 1 ].site;
			assert.equal( utils.getValueFromProgressStore( config ), null );
		} );
	} );

	describe( 'mergeFormWithValue', function() {
		const config = {
			fieldName: 'username',
			fieldValue: 'calypso'
		};

		it( 'should return the form with the field added if the field doesn\'t have a value', function() {
			const form = { username: {} };
			config.form = form;
			assert.deepEqual( utils.mergeFormWithValue( config ), {
				username: { value: 'calypso' }
			} );
		} );

		it( 'should return the form unchanged if there is already a value in the form', function() {
			const form = { username: { value: 'wordpress' } };
			config.form = form;
			assert.equal( utils.mergeFormWithValue( config ), form );
		} );
	} );
} );
