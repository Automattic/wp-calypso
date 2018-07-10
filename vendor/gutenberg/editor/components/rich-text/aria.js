/**
 * External dependencies
 */

import {
	difference,
	isEqual,
	isNil,
	keys,
	pickBy,
	startsWith,
} from 'lodash';

const isAriaPropName = ( name ) =>
	startsWith( name, 'aria-' );

export const pickAriaProps = ( props ) =>
	pickBy( props, ( value, key ) => isAriaPropName( key ) && ! isNil( value ) );

export const diffAriaProps = ( props, nextProps ) => {
	const prevAriaKeys = keys( pickAriaProps( props ) );
	const nextAriaKeys = keys( pickAriaProps( nextProps ) );
	const removedKeys = difference( prevAriaKeys, nextAriaKeys );
	const updatedKeys = nextAriaKeys.filter( ( key ) =>
		! isEqual( props[ key ], nextProps[ key ] ) );
	return { removedKeys, updatedKeys };
};
