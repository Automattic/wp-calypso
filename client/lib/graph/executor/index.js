/**
 * External dependencies
 */
import { isArray, isPlainObject, isFunction } from 'lodash';

const resolveNode = ( node, resolver, context ) => {
	let resolved = resolver;
	if ( isFunction( resolver ) ) {
		resolved = resolver( node.arguments, context );
	}
	if ( isPlainObject( resolved ) ) {
		return resolveNodes( node.nodes, resolved, context ); // eslint-disable-line no-use-before-define
	}
	if ( isArray( resolved ) ) {
		return resolved.map(
			resolvedItem => resolveNodes( node.nodes, resolvedItem, context ) // eslint-disable-line no-use-before-define
		);
	}
	return resolved;
};

const resolveNodes = ( nodes, resolvers = {}, context ) => {
	return nodes.reduce( ( memo, node ) => {
		memo[ node.name ] = resolveNode( node, resolvers[ node.name ], context );
		return memo;
	}, {} );
};

export default ( query, rootResolver, context ) =>
	new Promise( ( resolve ) => {
		const data = resolveNodes( query.nodes, rootResolver, context );
		resolve( { data } );
	} );
