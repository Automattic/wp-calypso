/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */
const fixture = require( './fixture' );

describe( 'wpcom.site.category', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	let new_category;

	// Create a testing_category before to start tests
	let testing_category;
	before( ( done ) => {
		fixture.category.name += String( ( Math.random() * 1000000 ) | 0 );

		site
			.category()
			.add( fixture.category )
			.then( ( category ) => {
				testing_category = category;
				done();
			} )
			.catch( done );
	} );

	// Delete testing category
	after( ( done ) => {
		site
			.category( testing_category.slug )
			.delete()
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.category.get', function () {
		it( 'should get added category', () => {
			return new Promise( ( done ) => {
				site
					.category( testing_category.slug )
					.get()
					.then( ( data ) => {
						assert.ok( data );
						assert.ok( data instanceof Object, 'data is not an object' );
						assert.equal( testing_category.slug, data.slug );
						assert.equal( testing_category.name, data.name );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.category.add', function () {
		it( 'should add a new category', () => {
			return new Promise( ( done ) => {
				const category = site.category();

				fixture.category.name += '-added';
				category
					.add( fixture.category )
					.then( ( data ) => {
						// checking some data date
						assert.ok( data );
						assert.ok( data instanceof Object, 'data is not an object' );

						// store added catogory
						new_category = data;

						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.category.update', function () {
		it( 'should edit the new added category', () => {
			return new Promise( ( done ) => {
				const category = site.category( new_category.slug );
				const edited_name = fixture.category.name + '-updated';

				category
					.update( { name: edited_name } )
					.then( ( data ) => {
						assert.ok( data );
						assert.equal( edited_name, data.name );

						// update added category
						new_category = data;

						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.category.delete', function () {
		it( 'should delete the new added category', () => {
			return new Promise( ( done ) => {
				site
					.category( new_category.slug )
					.delete()
					.then( ( data ) => {
						assert.ok( data );
						assert.equal( 'true', data.success );
						assert.equal( new_category.slug, data.slug );

						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
