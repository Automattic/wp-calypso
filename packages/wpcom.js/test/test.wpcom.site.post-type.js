/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * site.postType
 */
describe( 'wpcom.site.postType', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const postType = site.postType( 'post' );

	describe( 'wpcom.site.postType.taxonomiesList', function () {
		it( 'should return a list of taxonomies', function () {
			return postType.taxonomiesList().then( function ( data ) {
				const taxonomy = data.taxonomies[ 0 ];
				assert.ok( data );
				assert.equal( 'number', typeof data.found );
				assert.ok( data.taxonomies.length >= 1 );
				assert.equal( 'string', typeof taxonomy.name );
				assert.equal( 'string', typeof taxonomy.label );
				assert.equal( '[object Object]', Object.prototype.toString.call( taxonomy.labels ) );
				assert.equal( 'string', typeof taxonomy.description );
				assert.equal( 'boolean', typeof taxonomy.hierarchical );
				assert.equal( 'boolean', typeof taxonomy.public );
				assert.equal( '[object Object]', Object.prototype.toString.call( taxonomy.capabilities ) );
			} );
		} );
	} );
} );
