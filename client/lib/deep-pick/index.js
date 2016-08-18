import { get, transform } from 'lodash';

const arrayOf = x => Array.isArray( x ) ? x : [ x ];

export default ( obj, keys ) =>
	transform( arrayOf( keys ), ( acc, key ) => {
		acc[ key ] = get( obj, key );
	}, {} );
