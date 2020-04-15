/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * site.follow
 */
describe( 'wpcom.site.taxonomy', () => {
	// Global instances
	var wpcom = util.wpcom();
	var site = wpcom.site( util.site() );
	var taxonomy = site.taxonomy( 'category' );

	describe( 'wpcom.site.taxonomy.termsList', () => {
		it( 'should return a list of terms', ( done ) => {
			taxonomy
				.termsList()
				.then( ( data ) => {
					let foundTerm = data.terms[ 0 ];
					assert.ok( data );
					assert.equal( 'number', typeof data.found );
					assert.ok( data.terms.length >= 1 );
					assert.ok( 'string', typeof foundTerm.name );
					assert.ok( 'string', typeof foundTerm.slug );
					assert.ok( 'string', typeof foundTerm.description );
					assert.ok( 'number', typeof foundTerm.post_count );
					assert.ok( 'number', typeof foundTerm.parent );
					done();
				} )
				.catch( done );
		} );
	} );
} );
