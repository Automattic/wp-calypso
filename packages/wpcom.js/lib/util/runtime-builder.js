/**
 * Module dependencies
 */
import methodBuilder from './runtime-method';

/**
 * Add methods to the given Class in the
 * runtime process.
 *
 * @param {*} Class - class to extend
 * @param {Array} list - methods list
 */
export default function( Class, list ) {
	list.forEach( item => {
		item = 'object' === typeof item ? item : { name: item }
		Class.prototype[ item.name ] = methodBuilder( item.name, item.subpath );
	} );
};
