/**
 * External dependencies
 */
var chai = require( 'chai' ),
	expect = chai.expect,
	ReactDom = require( 'react-dom' ),
	React = require( 'react/addons' ),
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	TestUtils = React.addons.TestUtils;

/**
 * Mocks & fixtures
 */
var mockedPluginAction = require( './mocks/plugin-action' ),
	fixtures = require( './fixtures' ),
	mockedActions = require( './mocks/actions' );

require( 'lib/react-test-env-setup' )();

describe( 'PluginActivateToggle', function() {
	var PluginActivateToggle, analyticsMock;

	analyticsMock = {
		ga: { recordEvent: sinon.spy() },
		tracks: { recordEvent: sinon.spy() }
	};

	before( function() {
		mockery.registerMock( 'analytics', analyticsMock );
		mockery.registerMock( 'my-sites/plugins/plugin-action/plugin-action', mockedPluginAction );
		mockery.registerMock( 'lib/plugins/actions', mockedActions );
		mockery.registerSubstitute( 'matches-selector', 'component-matches-selector' );
		mockery.registerSubstitute( 'query', 'component-query' );
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
	} );

	beforeEach( function() {
		PluginActivateToggle = require( 'my-sites/plugins/plugin-activate-toggle' );
		PluginActivateToggle.prototype.translate = function( str ) {
			return str;
		};
	} );

	afterEach( function() {
		ReactDom.unmountComponentAtNode( document.body );
		mockedActions.togglePluginActivation.reset();
		analyticsMock.ga.recordEvent.reset();
	} );

	it( 'should render the component', function() {
		var rendered = TestUtils.renderIntoDocument( <PluginActivateToggle { ...fixtures } /> ),
			pluginActionToggle = TestUtils.scryRenderedDOMComponentsWithClass( rendered, 'plugin-action' );

		expect( pluginActionToggle.length ).to.equal( 1 );
	} );

	it( 'should register an event when the subcomponent action is executed', function() {
		var rendered = TestUtils.renderIntoDocument( <PluginActivateToggle { ...fixtures } /> ),
			pluginActionToggle = ReactDom.findDOMNode( rendered );

		TestUtils.Simulate.click( pluginActionToggle );

		expect( analyticsMock.ga.recordEvent.called ).to.equal( true );
		expect( analyticsMock.tracks.recordEvent.called ).to.equal( true );
	} );

	it( 'should call an action when the subcomponent action is executed', function() {
		var rendered = TestUtils.renderIntoDocument( <PluginActivateToggle { ...fixtures } /> ),
			pluginActionToggle = ReactDom.findDOMNode( rendered );

		TestUtils.Simulate.click( pluginActionToggle );

		expect( mockedActions.togglePluginActivation.called ).to.equal( true );
	} );
} );

