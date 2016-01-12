require( 'lib/react-test-env-setup' )();

/**
 * External dependencies
 */
const chai = require( 'chai' ),
	expect = chai.expect,
	sinonChai = require( 'sinon-chai' );

/**
 * Internal dependencies
 */
const path = require( 'path' ),
	WpcomVCR = require( 'lib/wpcom-mock/wpcom-vcr' )

chai.use( sinonChai );

describe( 'WpcomVCR', function() {
	before( function() {
		this.vcr = new WpcomVCR( path.join( __dirname, 'lib' ) );
	} );

	it( 'can load an existing cassette', function() {
		this.vcr.useCassette( 'cassette1' );
		expect( this.vcr.recording ).to.be.an.object;
		expect( Object.keys( this.vcr.recording ) ).to.have.length( 2 );
	} );

	it( 'can add an entry to the loaded cassette', function() {
		this.vcr.addEntry( {
			params: {
				apiVersion: '1.1',
				method: 'GET',
				path: '/users',
				query: ''
			},
			response: {
				users: [ 1, 2, 3 ]
			}
		} );
		expect( this.vcr.recording ).to.be.an.object;
		expect( Object.keys( this.vcr.recording ) ).to.have.length( 3 );
		expect( this.vcr.recording['GET /users'] ).to.be.an.object;
	} );

	it( 'can match a GET request', function() {
		var request;

		request = this.vcr.matchRequest( {
			method: 'GET',
			path: '/users'
		} );

		expect( request ).to.deep.equal( {
			params: {
				apiVersion: '1.1',
				method: 'GET',
				path: '/users',
				query: ''
			},
			response: {
				users: [ 1, 2, 3 ]
			}
		} );
	} );

	it( 'can match a POST request', function() {
		var request;

		request = this.vcr.matchRequest( {
			method: 'POST',
			path: '/sites/75913855/menus/new',
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
				]
			}
		} );

		expect( request ).to.be.an.object;
		expect( request.response ).to.deep.equal( {
			id: 5319,
			_headers: {
				Date: 'Tue, 15 Sep 2015 14:16:53 GMT',
				'Content-Type': 'application/json'
			}
		} );
	} );

	it( 'can reset', function() {
		this.vcr.reset();
		expect( this.vcr.recording ).to.be.an.object;
		expect( Object.keys( this.vcr.recording ) ).to.have.length( 0 );
	} );
} );
