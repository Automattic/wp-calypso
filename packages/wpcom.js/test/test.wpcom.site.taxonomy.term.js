/**
 * Module dependencies
 */
var util = require( './util' );
var assert = require( 'assert' );

/**
 * site.taxonomy.term
 */
describe( 'wpcom.site.taxonomy.term', () => {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	const taxonomy = site.taxonomy( 'category' );
	const testTermAttributes = { name: 'Chicken and Ribs', description: 'noms' };
	let testTerm;
	let testTermTwo;

	// Create a testTerm
	before( ( done ) => {
		taxonomy
			.term()
			.add( testTermAttributes )
			.then( ( term ) => {
				testTerm = term;
				done();
			} )
			.catch( done );
	} );

	after( ( done ) => {
		// delete testTerm
		taxonomy
			.term( testTerm.slug )
			.delete()
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.taxonomy.term.get', () => {
		it( 'should return term details', ( done ) => {
			taxonomy
				.term( testTerm.slug )
				.get()
				.then( ( data ) => {
					assert.ok( data );
					assert.ok( 'string', typeof data.name );
					assert.ok( 'string', typeof data.slug );
					assert.ok( 'string', typeof data.description );
					assert.ok( 'number', typeof data.post_count );
					assert.ok( 'number', typeof data.parent );
					assert.ok( 'number', typeof data.ID );
					assert.equal( testTerm.ID, data.ID );
					assert.equal( testTerm.name, data.name );
					done();
				} )
				.catch( done );
		} );

		it( 'should not return an error for unknown_taxonomy', ( done ) => {
			taxonomy
				.term( 'i-ate-all-the-chicken-and-ribs' )
				.get()
				.catch( ( data ) => {
					assert.ok( data );
					assert.equal( data.error, 'unknown_taxonomy' );
					done();
				} );
		} );
	} );

	describe( 'wpcom.site.taxonomy.term.add', () => {
		it( 'should create a new term', ( done ) => {
			taxonomy
				.term()
				.add( { name: 'chunky bacon', parent: testTerm.ID, description: 'I LOVE BACON MOAR' } )
				.then( ( data ) => {
					testTermTwo = data;
					assert.ok( data );
					assert.equal( data.name, 'chunky bacon' );
					assert.equal( data.parent, testTerm.ID );
					assert.equal( data.description, 'I LOVE BACON MOAR' );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.taxonomy.term.update', () => {
		it( 'should update the term', ( done ) => {
			taxonomy
				.term( testTermTwo.slug )
				.update( { parent: 0, description: 'I LOVE RIBS AND BACON' } )
				.then( ( data ) => {
					assert.ok( data );
					assert.equal( data.slug, testTermTwo.slug );
					assert.equal( data.description, 'I LOVE RIBS AND BACON' );
					assert.equal( data.parent, 0 );
					done();
				} )
				.catch( done );
		} );
	} );

	describe( 'wpcom.site.taxonomy.term.delete', () => {
		it( 'should update the term', ( done ) => {
			taxonomy
				.term( testTermTwo.slug )
				.delete()
				.then( ( data ) => {
					assert.ok( data );
					done();
				} )
				.catch( done );
		} );
	} );
} );
