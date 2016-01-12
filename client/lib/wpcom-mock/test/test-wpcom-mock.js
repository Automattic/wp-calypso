require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
const path = require( 'path' ),
	chai = require( 'chai' ),
	expect = chai.expect,
	sinon = require( 'sinon' ),
	sinonChai = require( 'sinon-chai' );

/**
 * Internal dependencies
 */
const Dispatcher = require( 'dispatcher' ),
	UsersActions = require( 'lib/users/actions' ),
	WPCOM = require( 'lib/wp' ),
	WpcomMock = require( 'lib/wpcom-mock' ),
	WpcomVCR = require( 'lib/wpcom-mock/wpcom-vcr' ),
	usersData = require( './lib/mock-users-data' );

/**
 * Module variables
 */
const siteId = 75913855;

chai.use( sinonChai );

describe( 'WpcomMock', function() {
	beforeEach( function() {
		this.sinon = sinon.sandbox.create();
		this.wpcom = WpcomMock( {
			sinonSandbox: this.sinon,
			recordingsDir: path.join( __dirname, 'lib' )
		} );
	} );

	afterEach( function() {
		this.sinon.restore();
		// This is required since UsersStore keeps it's internal state at the module level at the moment
		delete require.cache[ require.resolve( 'lib/users/store' ) ];
	} );

	it( 'has a vcr property', function() {
		expect( this.wpcom.vcr ).to.be.an.instanceof( WpcomVCR );
	} );

	it( 'has a requestStub property', function() {
		expect( this.wpcom.requestStub ).to.be.an.object;
		expect( this.wpcom.requestStub.returns ).to.be.a.function;
		expect( this.wpcom.requestStub.throws ).to.be.a.function;
	} );

	describe( '#mock()', function() {
		it( 'should return the wpcom module', function() {
			expect( this.wpcom.mock() ).to.equal( WPCOM );
		} );
	} );

	describe( '#mockRequest()', function() {
		it( 'should add a new entry to the current recording', function() {
			var request;

			expect( Object.keys( this.wpcom.vcr.recording ) ).to.have.length( 0 );

			this.wpcom.mockRequest( {
				params: {
					method: 'GET',
					path: '/hello'
				},
				response: 'world'
			} );

			expect( Object.keys( this.wpcom.vcr.recording ) ).to.have.length( 1 );

			request = this.wpcom.vcr.matchRequest( {
				method: 'GET',
				path: '/hello'
			} );

			expect( request ).to.be.ok;
			expect( request.response ).to.equal( 'world' );
		} );
	} );

	describe( '#mockWith()', function() {
		beforeEach( function() {
			this.wpcom.mockWith( 'cassette1' );
			expect( Object.keys( this.wpcom.vcr.recording ) ).to.have.length.above( 0 );
		} );

		it( 'should match GET requests', function() {
			var request;
			request = this.wpcom.vcr.matchRequest( {
				method: 'GET',
				path: '/sites/75913855/users',
				apiVersion: '1.1',
				query: 'number=100&offset=0&order=ASC&order_by=display_name&search=&search_columns%5B%5D=display_name&search_columns%5B%5D=user_login&siteId=75913855'
			} );

			expect( request ).to.be.ok;
			expect( request.response ).to.deep.equal( {
				found: 1,
				users: [
					{
						ID: 42802006,
						avatar_URL: 'https://1.gravatar.com/avatar/1fbe2cbf81d138800009924725439779?s=96&d=identicon&r=G',
						email: 'allendav@automattic.com',
						login: 'allendav',
						name: 'Allen S (allendav)',
						nice_name: 'allendav',
						profile_URL: 'http://en.gravatar.com/allendav',
						roles: [ 'editor' ],
						site_ID: 43405119
					}
				],
				_headers: {
					Date: 'Tue, 15 Sep 2015 14:15:42 GMT',
					'Content-Type': 'application/json'
				}
			} );
		} );
		it( 'should match POST requests', function() {
			var request;
			request = this.wpcom.vcr.matchRequest( {
				method: 'POST',
				path: '/sites/75913855/menus/new',
				apiVersion: '1.1',
				body: {
					name: 'Menu 1',
					items: [
						{
							name: 'About',
							type: 'page',
							type_family: 'post_type',
							content_id: 1,
							items: [],
							id: 1
						},
						{
							name: 'Test Page',
							type: 'page',
							type_family: 'post_type',
							content_id: 8,
							items: [],
							id: 2
						},
						{
							name: 'New item',
							type: 'page',
							type_family: 'post_type',
							status: 'publish',
							id: 3
						}
					],
					locations: [ 'primary' ],
					description: '',
					id: 5319
				}
			} );

			expect( request ).to.be.ok;
			expect( request.response ).to.deep.equal( {
				id: 5319,
				_headers: {
					Date: 'Tue, 15 Sep 2015 14:16:53 GMT',
					'Content-Type': 'application/json'
				}
			} );
		} );
	} );

	describe( 'Example: Fetching users', function() {
		var fetchOptions = {
			number: 100,
			offset: 0,
			order: 'ASC',
			order_by: 'display_name',
			search: null,
			search_columns: [ 'display_name', 'user_login' ],
			siteId: siteId
		};

		it( 'by mocking the request directly', function() {
			const spy = this.sinon.spy( Dispatcher, 'dispatch' );

			this.wpcom.mockRequest( {
				params: {
					apiVersion: '1.1',
					method: 'GET',
					path: `/sites/${siteId}/users`,
					query: WpcomMock.utils.queryString( fetchOptions )
				},
				response: usersData
			} );

			UsersActions.fetchUsers( fetchOptions );

			expect( spy ).to.have.been.calledTwice;

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

		it( 'by mocking the API method call', function() {
			const spy = this.sinon.spy( Dispatcher, 'dispatch' );

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

		it( 'by loading a recording', function() {
			const spy = this.sinon.spy( Dispatcher, 'dispatch' );

			this.wpcom.mockWith( 'mock-requests' );

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
					data: {
						found: 7,
						users: usersData.users,
						_headers: {
							'Content-Type': 'application/json',
							Date: 'Tue, 15 Sep 2015 14:15:42 GMT'
						}
					},
					error: null,
					fetchOptions: fetchOptions,
					type: 'RECEIVE_USERS'
				},
				source: 'SERVER_ACTION'
			} );

			expect( spy.args[0][0].source ).to.be.equal( 'VIEW_ACTION' );
			expect( spy.args[1][0].source ).to.be.equal( 'SERVER_ACTION' );
		} );

		it( 'by mocking the request directly and testing an error response', function() {
			const spy = this.sinon.spy( Dispatcher, 'dispatch' );

			this.wpcom.mockRequest( {
				params: {
					apiVersion: '1.1',
					method: 'GET',
					path: `/sites/${siteId}/users`,
					query: WpcomMock.utils.queryString( fetchOptions )
				},
				error: 'Server Error'
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
					data: undefined,
					error: new Error( 'Server Error' ),
					fetchOptions: fetchOptions,
					type: 'RECEIVE_USERS'
				},
				source: 'SERVER_ACTION'
			} );
		} );

		it( 'by mocking the API method call and testing an error response', function() {
			const spy = this.sinon.spy( Dispatcher, 'dispatch' );

			this.wpcom.mock().site( siteId ).usersList( fetchOptions, function( mockResponse ) {
				mockResponse( new Error( 'Server Error' ) );
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
					data: undefined,
					error: new Error( 'Server Error' ),
					fetchOptions: fetchOptions,
					type: 'RECEIVE_USERS'
				},
				source: 'SERVER_ACTION'
			} );
		} );
	} );
} );
