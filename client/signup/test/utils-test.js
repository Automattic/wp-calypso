/**
 * External dependencies
 */
var debug = require( 'debug' )( 'calypso:client:signup:controller-utils:test' ), // eslint-disable-line no-unused-vars
	sinon = require( 'sinon' ),
	assert = require( 'assert' );

/**
 * Internal dependencies
 */
var utils = require( '../utils' ),
	flows = require( 'signup/config/flows' ),
	defaultFlowName = require( 'signup/config/flows' ).defaultFlowName;

debug( 'start utils test' );

describe( 'utils.getLocale', function() {
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

describe( 'utils.getStepName', function() {
	it( 'should find the step name in either the stepName or flowName fragment', function() {
		assert.equal( utils.getStepName( { stepName: 'user' } ), 'user' );
		assert.equal( utils.getStepName( { flowName: 'user' } ), 'user' );
	} );

	it( 'should return undefined if no step name is found', function() {
		assert.equal( utils.getStepName( { flowName: 'account' } ), undefined );
	} );
} );

describe( 'utils.getFlowName', function() {
	afterEach( function() {
		flows.currentFlowName = 'account';
	} );

	it( 'should find the flow name in the flowName fragment if present', function() {
		assert.equal( utils.getFlowName( { flowName: 'other' } ), 'other' );
	} );

	it( 'should return the current flow if the flow is missing', function() {
		assert.equal( utils.getFlowName( {} ), 'account' );
	} );

	it( 'should call the currentFlowName if it is a function and the flow is missing', function() {
		flows.currentFlowName = sinon.stub().returns( 'called' );
		assert.equal( utils.getFlowName( {} ), 'called' );
	} );

	it( 'should call the currentFlowName with the requested flow if it is a function and the flow is not valid', function() {
		flows.currentFlowName = sinon.stub().returns( 'called' );
		utils.getFlowName( { flowName: 'invalid' } );
		assert( flows.currentFlowName.calledWith( 'invalid' ) );
	} );

	it( 'should not call currentFlowName if it is a function and the flow is present', function() {
		flows.currentFlowName = sinon.stub().returns( 'called' );
		assert.equal( utils.getFlowName( { flowName: 'other' } ), 'other' );
	} );
} );

describe( 'utils.getValidPath - currentFlowName !== defaultFlowName', function() {
	it( 'should redirect to the current flow if no flow is present', function() {
		assert.equal( utils.getValidPath( {} ), '/start/account/user' );
	} );

	it( 'should redirect invalid steps', function() {
		assert.equal( utils.getValidPath( {
			flowName: 'user',
			stepName: 'fr',
			stepSectionName: 'fr'
		} ), '/start/account/user/fr' );
	} );

	it( 'should redirect invalid flow/steps', function() {
		assert.equal( utils.getValidPath( {
			flowName: 'user',
			stepName: 'user',
			stepSectionName: 'fr'
		} ), '/start/account/user/fr' );
	} );

	it( 'should preserve a valid locale if one is specified', function() {
		assert.equal( utils.getValidPath( {
			flowName: 'user',
			stepName: 'fr',
			stepSectionName: 'abc'
		} ), '/start/account/user/abc/fr' );
	} );

	it( 'should handle arbitrary step section names', function() {
		var randomStepSectionName = 'random-step-section-' + Math.random();

		assert.equal( utils.getValidPath( {
			flowName: 'account',
			stepName: 'user',
			stepSectionName: randomStepSectionName,
			lang: 'fr'
		} ), '/start/account/user/' + randomStepSectionName + '/fr' );
	} );
} );

describe( 'utils.getValidPath - currentFlowName === defaultFlowName', function() {
	it( 'should redirect to the current flow if no flow is present', function() {
		flows.currentFlowName = defaultFlowName;
		assert.equal( utils.getValidPath( {} ), '/start/user' );
	} );

	it( 'should redirect invalid steps', function() {
		flows.currentFlowName = defaultFlowName;
		assert.equal( utils.getValidPath( {
			flowName: 'user',
			stepName: 'fr',
			stepSectionName: 'fr'
		} ), '/start/user/fr' );
	} );

	it( 'should redirect invalid flow/steps', function() {
		flows.currentFlowName = 'main';
		assert.equal( utils.getValidPath( {
			flowName: 'user',
			stepName: 'user',
			stepSectionName: 'fr'
		} ), '/start/user/fr' );
	} );

	it( 'should preserve a valid locale if one is specified', function() {
		flows.currentFlowName = 'main';
		assert.equal( utils.getValidPath( {
			flowName: 'user',
			stepName: 'fr',
			stepSectionName: 'abc'
		} ), '/start/user/abc/fr' );
	} );
} );

describe( 'utils.getValueFromProgressStore', function() {
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
		delete testStore[1].site;
		assert.equal( utils.getValueFromProgressStore( config ), null );
	} );
} );

describe( 'utils.mergeFormWithValue', function() {
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
