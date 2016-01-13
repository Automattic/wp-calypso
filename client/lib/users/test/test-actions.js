require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
const chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' );

/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	UsersActions = require( 'lib/users/actions' ),
	WpcomMock = require( 'lib/wpcom-mock' ),
	site = require( './lib/mock-site' ),
	usersData = require( './lib/mock-users-data' );

/**
 * Module variables
 */
const siteId = site.ID;

chai.use( sinonChai );

describe( 'Users Actions', function() {
	beforeEach( function() {
		this.sinon = sinon.sandbox.create();
		this.wpcom = WpcomMock.create( { sinonSandbox: this.sinon } );
	} );

	afterEach( function() {
		this.sinon.restore();
		// This is required since UsersStore keeps it's internal state at the module level at the moment
		delete require.cache[ require.resolve( 'lib/users/store' ) ];
	} );

	it( 'UsersActions should be an object', function() {
		expect( UsersActions ).to.be.an.object;
	} );

	describe( 'Fetching users', function() {
		it( 'UsersActions should have method fetchUsers', function() {
			expect( UsersActions.fetchUsers ).to.be.a.function;
		} );

		it( 'should trigger a VIEW_ACTION and a SERVER_ACTION on success', function() {
			const spy = this.sinon.spy( Dispatcher, 'dispatch' );

			var fetchOptions = {
				number: 100,
				offset: 0,
				order: 'ASC',
				order_by: 'display_name',
				search: null,
				search_columns: [ 'display_name', 'user_login' ],
				siteId: siteId
			};

			this.wpcom.mock().site( siteId ).usersList( fetchOptions, function( mockResponse ) {
				mockResponse( null, usersData );
			} );

			UsersActions.fetchUsers( fetchOptions );

			expect( spy ).to.have.been.calledWith( {
				action: {
					fetchOptions: fetchOptions,
					type: 'FETCHING_USERS'
				},
				source: 'VIEW_ACTION'
			} );

			expect( spy ).to.have.been.calledWith( {
				action: {
					data: usersData,
					error: null,
					fetchOptions: fetchOptions,
					type: 'RECEIVE_USERS'
				},
				source: 'SERVER_ACTION'
			} );
		} );
	} );
} );
