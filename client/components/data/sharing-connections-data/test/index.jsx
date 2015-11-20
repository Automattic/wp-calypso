/* eslint-disable vars-on-top */

/**
 * External dependencies
 */
var React = require( 'react/addons' ),
	TestUtils = React.addons.TestUtils,
	mockery = require( 'mockery' ),
	sinon = require( 'sinon' ),
	chai = require( 'chai' ),
	sinonChai = require( 'sinon-chai' ),
	expect = chai.expect;

chai.use( sinonChai );

/**
 * Module variables
 */
var DUMMY_SITE_ID = 77203074,
	DUMMY_CURRENT_USER_ID = 73705554,
	DUMMY_SECOND_USER_ID = 73705672,
	DUMMY_CURRENT_USER_CONNECTION = { ID: 1, keyring_connection_ID: 1, keyring_connection_user_ID: DUMMY_CURRENT_USER_ID },
	DUMMY_SECOND_USER_CONNECTION = { ID: 2, keyring_connection_ID: 2, keyring_connection_user_ID: DUMMY_SECOND_USER_ID },
	DUMMY_CONNECTIONS = [ DUMMY_CURRENT_USER_CONNECTION, DUMMY_SECOND_USER_CONNECTION ];

describe( 'SharingConnectionsData', function() {
	var getConnections, SharingConnectionsData, renderer;

	getConnections = sinon.stub();
	getConnections.withArgs( DUMMY_SITE_ID, { userId: DUMMY_CURRENT_USER_ID } ).returns( [ DUMMY_CURRENT_USER_CONNECTION ] );
	getConnections.withArgs( DUMMY_SITE_ID, { userId: DUMMY_SECOND_USER_ID } ).returns( [ DUMMY_SECOND_USER_CONNECTION ] );
	getConnections.withArgs( DUMMY_SITE_ID ).returns( DUMMY_CONNECTIONS );

	beforeEach( function() {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerMock( 'lib/user', function() {
			return {
				get: function() {
					return { ID: DUMMY_CURRENT_USER_ID };
				}
			};
		} );
		mockery.registerMock( 'lib/connections-list', function() {
			return {
				get: getConnections,
				initialized: true
			};
		} );

		SharingConnectionsData = require( '../' );
		getConnections.reset();
		renderer = TestUtils.createRenderer();
	} );

	after( function() {
		mockery.deregisterAll();
		mockery.disable();
	} );

	it( 'should assume an undefined userId should include connections available to the current user', function() {
		var result;

		renderer.render(
			<SharingConnectionsData siteId={ DUMMY_SITE_ID }>
				<div />
			</SharingConnectionsData>
		);
		result = renderer.getRenderOutput();

		expect( getConnections ).to.have.been.calledWith( DUMMY_SITE_ID, { userId: DUMMY_CURRENT_USER_ID } );
		expect( result.props.connections ).to.eql( [ DUMMY_CURRENT_USER_CONNECTION ] );
	} );

	it( 'should assume an explicit userId should include connections available to that user', function() {
		var result;

		renderer.render(
			<SharingConnectionsData siteId={ DUMMY_SITE_ID } userId={ DUMMY_SECOND_USER_ID }>
				<div />
			</SharingConnectionsData>
		);
		result = renderer.getRenderOutput();

		expect( getConnections ).to.have.been.calledWith( DUMMY_SITE_ID, { userId: DUMMY_SECOND_USER_ID } );
		expect( result.props.connections ).to.eql( [ DUMMY_SECOND_USER_CONNECTION ] );
	} );

	it( 'should assume a `null` userId should include all connections for the site', function() {
		var result;

		renderer.render(
			<SharingConnectionsData siteId={ DUMMY_SITE_ID } userId={ null }>
				<div />
			</SharingConnectionsData>
		);
		result = renderer.getRenderOutput();

		expect( getConnections ).to.have.been.calledWith( DUMMY_SITE_ID );
		expect( result.props.connections ).to.eql( DUMMY_CONNECTIONS );
	} );

	context( 'uninitialized connections-list', function() {
		beforeEach( function() {
			mockery.registerMock( 'lib/connections-list', function() {
				return {
					get: getConnections,
					initialized: false
				};
			} );

			delete require.cache[ require.resolve( '../' ) ];
			SharingConnectionsData = require( '../' );
		} );

		it( 'should pass `undefined` `connections` while the connections are being fetched', function() {
			var result;

			renderer.render(
				<SharingConnectionsData siteId={ DUMMY_SITE_ID }>
					<div />
				</SharingConnectionsData>
			);
			result = renderer.getRenderOutput();

			expect( result.props.connections ).to.be.undefined;
		} );
	} );
} );

