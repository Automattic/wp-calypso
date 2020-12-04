/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * site.follow
 */
describe( 'wpcom.site.taxonomy', () => {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const taxonomy = site.taxonomy( 'category' );

	describe( 'wpcom.site.taxonomy.termsList', () => {
		it( 'should return a list of terms', () => {
			return new Promise( ( done ) => {
				taxonomy
					.termsList()
					.then( ( data ) => {
						const foundTerm = data.terms[ 0 ];
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
} );
