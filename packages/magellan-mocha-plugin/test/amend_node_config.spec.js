/* eslint no-undef: 0, no-unused-expressions: 0, filenames/filenames: 0,
  no-magic-numbers: 0, camelcase: 0 */
'use strict';

var chai = require( 'chai' );
var expect = chai.expect;
var amendNodeConfig = require( '../lib/amend_node_config' );

describe( 'amendNodeConfig', function () {
	it( 'should look for node config', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: JSON.stringify( { a: 2 } ),
				},
				{ b: 2 }
			)
		).to.eql( { a: 2, b: 2 } );
	} );

	it( 'should look for node config with bad data', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: 'blarge',
				},
				{ b: 2 }
			)
		).to.eql( { b: 2 } );
	} );

	it( 'should look for node config with an object', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: { a: 2 },
				},
				{ b: 2 }
			)
		).to.eql( { a: 2, b: 2 } );
	} );

	it( 'should look for node config with a number', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: 5,
				},
				{ b: 2 }
			)
		).to.eql( { b: 2 } );
	} );
} );
