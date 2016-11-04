/**
 * External dependencies
 */
import {
	isArray,
	mergeWith,
} from 'lodash';

const concatHandlers = ( left, right ) =>
	isArray( left )
		? left.concat( right )
		: undefined;

export const mergeHandlers = ( ...handlers ) =>
	handlers.length > 1
		? mergeWith( {}, ...handlers, concatHandlers )
		: handlers.shift();
