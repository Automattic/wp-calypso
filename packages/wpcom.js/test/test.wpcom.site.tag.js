/**
 * Module dependencies
 */
const util = require( './util' );
const assert = require( 'assert' );

/**
 * Testing data
 */

const fixture = require( './fixture' );

/**
 * site.tag
 */

describe( 'wpcom.site.tag', function () {
	// Global instances
	const wpcom = util.wpcom();
	const site = wpcom.site( util.site() );
	let new_tag;

	// Create a testing_tag before to start tests
	let testing_tag;
	before( ( done ) => {
		fixture.tag.name += ( Math.random() * 1000000 ) | 0;
		site
			.tag()
			.add( fixture.tag )
			.then( ( tag ) => {
				testing_tag = tag;
				done();
			} )
			.catch( done );
	} );

	// Delete testing tag
	after( ( done ) => {
		site
			.tag( testing_tag.slug )
			.delete()
			.then( () => done() )
			.catch( done );
	} );

	describe( 'wpcom.site.tag.get', function () {
		it( 'should get added tag', () => {
			return new Promise( ( done ) => {
				const cat = site.tag( testing_tag.slug );

				cat
					.get()
					.then( ( data ) => {
						assert.ok( data );
						assert.ok( data instanceof Object, 'data is not an object' );
						assert.equal( testing_tag.slug, data.slug );
						assert.equal( testing_tag.name, data.name );
						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.tag.add', function () {
		it( 'should add a new tag', () => {
			return new Promise( ( done ) => {
				const tag = site.tag();
				fixture.tag.name += '-added';

				tag
					.add( fixture.tag )
					.then( ( data ) => {
						// checking some data date
						assert.ok( data );
						assert.ok( data instanceof Object, 'data is not an object' );

						// store added catogory
						new_tag = data;

						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.tag.update', function () {
		it( 'should edit the new added tag', () => {
			return new Promise( ( done ) => {
				const tag = site.tag( new_tag.slug );
				const edited_name = fixture.tag.name + '-updated';

				tag
					.update( { name: edited_name } )
					.then( ( data ) => {
						assert.ok( data );
						assert.equal( edited_name, data.name );

						// update added tag
						new_tag = data;

						done();
					} )
					.catch( done );
			} );
		} );
	} );

	describe( 'wpcom.site.tag.delete', function () {
		it( 'should delete the new added tag', () => {
			return new Promise( ( done ) => {
				const cat = site.tag( new_tag.slug );

				cat
					.delete()
					.then( ( data ) => {
						assert.ok( data );
						assert.equal( 'true', data.success );
						assert.equal( new_tag.slug, data.slug );

						done();
					} )
					.catch( done );
			} );
		} );
	} );
} );
