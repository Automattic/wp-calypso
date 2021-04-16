const amendNodeConfig = require( '../lib/amend_node_config' );

describe( 'amendNodeConfig', function () {
	it( 'should look for node config', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: JSON.stringify( { a: 2 } ),
				},
				{ b: 2 }
			)
		).toEqual( { a: 2, b: 2 } );
	} );

	it( 'should look for node config with bad data', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: 'blarge',
				},
				{ b: 2 }
			)
		).toEqual( { b: 2 } );
	} );

	it( 'should look for node config with an object', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: { a: 2 },
				},
				{ b: 2 }
			)
		).toEqual( { a: 2, b: 2 } );
	} );

	it( 'should look for node config with a number', function () {
		expect(
			amendNodeConfig(
				{
					NODE_CONFIG: 5,
				},
				{ b: 2 }
			)
		).toEqual( { b: 2 } );
	} );
} );
