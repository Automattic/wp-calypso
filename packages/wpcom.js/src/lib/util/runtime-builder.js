/**
 * Module dependencies
 */
import debugFactory from 'debug';

/**
 * Module vars
 */
const debug = debugFactory( 'wpcom:runtime' );

/**
 * Build a generic method
 *
 * @param {object} methodParams - method methodParams
 * @param {Function} buildPath - function called to build method path
 * @returns {string} method path
 */
const methodBuilder = ( methodParams, buildPath ) => {
	return function ( query, fn ) {
		const path = buildPath( methodParams, this );
		return this.wpcom.req.get( path, query, fn );
	};
};

/**
 * Add methods to the given Class in the
 * runtime process.
 *
 * @param {*} Class - class to extend
 * @param {Array} list - methods list
 * @param {Function} buildPath - function to build the method endpoint path
 */
export default function ( Class, list, buildPath ) {
	list.forEach( ( methodParams ) => {
		methodParams = 'object' === typeof methodParams ? methodParams : { name: methodParams };

		debug( 'Adding %o', methodParams.name );
		Class.prototype[ methodParams.name ] = methodBuilder( methodParams, buildPath );
	} );
}
