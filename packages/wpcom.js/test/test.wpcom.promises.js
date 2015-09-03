/**
 * WPCOM module
 */

var util = require('./util');
var assert = require('assert');

/**
 * Testing data
 */
function trueAssertion( done ) { return function() { done(); }; }
function trueCallback( callback ) { callback( null, true ); }
function falseAssertion( done ) { return function() { done( new Error('Failed!')); }; }
function falseCallback( callback ) { callback( true, null ); }

function timedCallback( delay, caller = trueCallback ) {
	return function( params, callback ) {
		setTimeout( function() { return caller.apply(null, [params, callback] ); }, delay );
	};
}

/**
 * WPCOM Promises
 */

describe('wpcom', function(){
	var wpcom = util.wpcom_public();

	describe('wpcom.Promise', function(){
		it('should resolve when true', done => {
			wpcom.Promise( trueCallback )
				.then( trueAssertion( done ) )
				.catch( falseAssertion( done ) );
		});

		it('should reject when false', done => {
			wpcom.Promise( falseCallback )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		});

		it('should fail when slower than timeout', done => {
			wpcom.Promise( timedCallback( 1000 ) )
				.timeout( 10 )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		});

		it('should still catch() with timeout()', done => {
			wpcom.Promise( timedCallback( 10, falseCallback ) )
				.timeout( 1000 )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		});

		it('should handle functions with no params', done => {
			let test = callback => callback( null, 1337 );

			wpcom.Promise( test )
				.then( data => {
					assert.equal( data, 1337 );
					done();
				})
				.catch( falseAssertion(done) );
		});

		it('should handle functions with one param', done => {
			let test = ( a, callback ) => callback( null, a );

			wpcom.Promise( test, 'spline' )
				.then( data => {
					assert.equal( data, 'spline' );
					done();
				})
				.catch( falseAssertion(done) );
		});

		it('should handle functions with 3+ params', done => {
			let test = (a, b, c, callback) => { callback( null, a + b + c ); };

			wpcom.Promise( test, 1, 2, 3 )
				.then( data => {
					assert.equal( data, 6 );
					done();
				})
				.catch( falseAssertion( done ) );
		});
	});

});
