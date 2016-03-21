/**
 * Module dependencies
 */
import debugFactory from 'debug';

const debug = debugFactory( 'wpcom:builder' );

/**
 * Add a method defined through of the given name, and subpath (optional)
 * to the given prototype.
 *
 * @param {name} name - method name
 * @param {String} [subpath] - endpoint subpath
 * @return {*} Class method
 */
export default function( name, subpath ) {
	debug( 'add %o - subpath: %o', name, subpath );

	return function( query, fn ) {
		var path = '/sites/' + this._id + '/' + subpath;
		return this.wpcom.req.get( path, query, fn );
	};
};
