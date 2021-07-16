function parseTranslateCallArguments( node, j ) {
	const singular = node.arguments[ 0 ];
	const additionalArgs = {};

	if ( singular.type !== j.Literal.toString() && singular.type !== j.BinaryExpression.toString() ) {
		console.log( 'Invalid translate call: ', singular );
	}

	if ( node.arguments[ 1 ]?.type === j.Literal.toString() ) {
		additionalArgs.plural = node.arguments[ 1 ];
	}

	const nextIndex = typeof additionalArgs.plural !== 'undefined' ? 2 : 1;

	if ( node.arguments[ nextIndex ]?.type === j.ObjectExpression.toString() ) {
		node.arguments[ nextIndex ].properties.forEach( ( property ) => {
			additionalArgs[ property.key.name ] = property.value;
		} );
	}

	if ( additionalArgs.hasOwnProperty( 'plural' ) && ! additionalArgs.hasOwnProperty( 'count' ) ) {
		additionalArgs.count = j.identifier( 'undefined' );
	}

	return { singular, ...additionalArgs };
}

const ARGUMENTS_ORDER = {
	__: [ 'singular' ],
	_n: [ 'singular', 'plural', 'count' ],
	_nx: [ 'singular', 'plural', 'count', 'context' ],
	_x: [ 'singular', 'context' ],
};

function applySprintf( node, j, parsedArguments ) {
	if ( parsedArguments.args ) {
		return j.callExpression( j.identifier( 'sprintf' ), [ node, parsedArguments.args ] );
	}

	return node;
}

function replaceComponentPlaceholders( node, j ) {
	if ( node.value ) {
		node.value = node.value.replace( /{{/gm, '<' ).replace( /}}/gm, '>' );
	}

	if ( node.left ) {
		replaceComponentPlaceholders( node.left, j );
	}

	if ( node.right ) {
		replaceComponentPlaceholders( node.right, j );
	}
}

function applyCreateInterpolateElement( node, j, parsedArguments ) {
	if ( parsedArguments.components ) {
		replaceComponentPlaceholders( parsedArguments.singular, j );

		if ( parsedArguments.plural ) {
			replaceComponentPlaceholders( parsedArguments.plural, j );
		}

		return j.callExpression( j.identifier( 'createInterpolateElement' ), [
			node,
			parsedArguments.components,
		] );
	}

	return node;
}

function replaceWithWordpressI18nCall( node, j ) {
	const parsedArguments = parseTranslateCallArguments( node, j );
	let translateFunction = '__';

	if (
		typeof parsedArguments.plural !== 'undefined' &&
		typeof parsedArguments.context !== 'undefined'
	) {
		translateFunction = '_nx';
	} else if ( typeof parsedArguments.plural !== 'undefined' ) {
		translateFunction = '_n';
	} else if ( typeof parsedArguments.context !== 'undefined' ) {
		translateFunction = '_x';
	}

	// Determine if it's a basic or member call expresion based on the existance of the `callee.property`
	const isMemberCall = node.callee.property;

	if ( isMemberCall ) {
		node.callee.property.name = translateFunction;
	} else {
		node.callee.name = translateFunction;
	}

	// Rewrite Arguments
	node.arguments = ARGUMENTS_ORDER[ translateFunction ].map( ( key ) => parsedArguments[ key ] );

	const tranformers = [ applySprintf, applyCreateInterpolateElement ];

	return tranformers.reduce(
		( nodeAccumulator, transformer ) => transformer( nodeAccumulator, j, parsedArguments, node ),
		node
	);
}

module.exports = function ( file, api ) {
	module.asd = module.asd || new Set();
	const j = api.jscodeshift;
	const root = j( file.source );

	const callExpressionPaths = [
		// Basic translate call expression, e.g. `translate( 'string' )`
		{ name: 'translate' },

		// Object member call expression, e.g. `this.props.translate( 'string' )`
		{ property: { name: 'translate' } },
	];

	callExpressionPaths.forEach( ( calleeParams ) => {
		root
			.find( j.CallExpression, {
				callee: calleeParams,
			} )
			.replaceWith( ( node ) => replaceWithWordpressI18nCall( node.value, j ) );
	} );

	// print
	return root.toSource();
};
