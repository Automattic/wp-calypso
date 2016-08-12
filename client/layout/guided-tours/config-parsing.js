/**
 * External dependencies
 */
import { Children } from 'react';
import {
	chunk,
	fromPairs,
	flatMap,
	flow,
	property,
	zipObject,
} from 'lodash';

/*
 * Transforms
 *
 *   [ 'a', 'b', 'c', 'd', 'e', 'f' ]
 *
 * into
 *
 *   { a: 'b', c: 'd', e: 'f' }
 */
const fromPairsSequence = flow(
	xs => chunk( xs, 2 ),
	fromPairs
);

/*
 * Transforms a tree of elements (Step or deeper) into a sequence with the
 * following shape:
 *
 *   [ 'next', 'my-sites', 'continue', 'some-other-step' ]
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
const branching = element => {
	if ( ! element || ! element.props ) {
		return [];
	}

	if ( element.props.step ) {
		return [ element.type.name.toLowerCase(), element.props.step ];
	}

	return flatMap(
		Children.toArray( element.props.children ),
		c => branching( c ) || []
	);
};

export const tourBranching = tourTree => {
	const steps = Children
		.toArray( tourTree.props.children );

	const stepsBranching = steps
		.map( branching )
		.map( fromPairsSequence );

	return zipObject(
		steps.map( property( 'props.name' ) ),
		stepsBranching
	);
};
