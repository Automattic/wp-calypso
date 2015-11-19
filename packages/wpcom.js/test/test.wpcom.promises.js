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

	describe('wpcom.promises', function(){
		it('should fail when slower than timeout', done => {
			wpcom.site(util.site()).postsList()
				.timeout( 10 )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		});

		it('should still catch() with timeout()', done => {
			wpcom.site(util.site()).post(-5).get()
				.timeout( 10000 )
				.then( falseAssertion( done ) )
				.catch( trueAssertion( done ) );
		});
	});

});
