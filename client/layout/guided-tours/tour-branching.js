/**
 * External dependencies
 */

import { Children } from 'react';
import { fromPairs, flatMap, identity, isFunction } from 'lodash';

/*
 * Transforms a React `Children` object into an array. The children of a `Step` are
 * a render prop and we need to call the function to get the children array.
 */
const childrenToArray = ( children ) => {
	if ( isFunction( children ) ) {
		children = children( { translate: identity } );
	}

	return Children.toArray( children );
};

/*
 * Transforms a tree of elements (Step or deeper) into a sequence with the
 * following shape:
 *
 *   [ [ 'next', 'my-sites' ], [ 'continue', 'some-other-step' ] ]
 *
 * It achieves this thanks to two premises:
 *
 * - Whatever the result type for any given `element` (may be empty element,
 *   leaf element or element with children), return a list, which may or may
 *   not have values.
 *
 * - Using `flatMap` rather than `map` preserves the simple list type of the
 *   branching data even as we go up a level in the element tree. For instance,
 *   if element A has two leaves B and C, with
 *
 *     branching( B ) = [ 'b1', 'b2' ]
 *
 *   and
 *
 *     branching( C ) = [ 'c1', 'c2' ]
 *
 *   then
 *
 *     branching( A ) = flatten( branching( B ), branching( C ) )
 *                    = [ 'b1', 'b2', 'c1', 'c2' ]
 *
 * Using lists and `flatMap` also works nicely with empty values, because the
 * empty list is a flattening identity, i.e.:
 *
 *   flatten( xs, [] ) === flatten( xs )
 *
 * The end result is that `flatMap` acts as an all-in-one map-filter-combine
 * chain.
 *
 */
const branching = ( element ) => {
	// Skip null elements and text nodes
	if ( ! element || ! element.props ) {
		return [];
	}

	// If the element has a `step` prop, it's the leaf branching node we're looking for
	if ( element.props.step ) {
		const typeName = element.type.displayName || element.type.name || 'unknown';
		return [ [ typeName.toLowerCase(), element.props.step ] ];
	}

	return flatMap( childrenToArray( element.props.children ), branching );
};

/*
 * From a JSX tree of a Tour, find how `Next` and `Continue` components link from one
 * `Step` to another. For example, for a `<Step name="init" />` that contains a
 * `<Next step='upload-image' />` button, the returned branching object will have a record:
 * {
 *   'init': { 'next': 'upload-image' }
 * }
 * This data is used to skip steps (`Step.skipToNext`) and to figure out if a step is the
 * last one in a tour (`isLastStep` in tour context).
 */
export const tourBranching = ( tourTree ) => {
	const steps = childrenToArray( tourTree.props.children );

	return fromPairs( steps.map( ( step ) => [ step.props.name, fromPairs( branching( step ) ) ] ) );
};
