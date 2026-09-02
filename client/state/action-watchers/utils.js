import { mergeWith } from '@automattic/js-utils';

/**
 * Merge customizer for `mergeWith`.
 *
 * Note that a return value of `undefined`
 * defers to the default merge algorithm.
 *
 * In this case, we want to merge keys if
 * they don't exists but when they do, we
 * prefer to concatenate lists instead of
 * overwriting them.
 * @param {?Array<Function>} left existing handlers
 * @param {Array<Function>} right new handlers to add
 * @returns {Array<Function>} combined handlers
 */
const concatHandlers = ( left, right ) =>
	Array.isArray( left ) ? left.concat( right ) : undefined;

export const mergeHandlers = ( ...handlers ) =>
	handlers.length > 1
		? mergeWith( Object.create( null ), ...handlers, concatHandlers )
		: handlers[ 0 ];
