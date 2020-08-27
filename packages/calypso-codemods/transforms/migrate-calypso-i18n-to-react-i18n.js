function parseTranslateCallArguments( node, j ) {
	const singular = node.value.arguments[ 0 ];
	const additionalArgs = {};

	if ( singular.type !== j.Literal.toString() && singular.type !== j.BinaryExpression.toString() ) {
		// console.log( 'Invalid translate call: ', singular );
	}

	if ( node.value.arguments[ 1 ]?.type === j.Literal.toString() ) {
		additionalArgs.plural = node.value.arguments[ 1 ];
	}

	const nextIndex = typeof additionalArgs.plural !== 'undefined' ? 2 : 1;

	if ( node.value.arguments[ nextIndex ]?.type === j.ObjectExpression.toString() ) {
		node.value.arguments[ nextIndex ].properties.forEach( ( property ) => {
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
	const isMemberCall = node.value.callee.property;

	if ( isMemberCall ) {
		node.value.callee.property.name = translateFunction;
	} else {
		node.value.callee.name = translateFunction;
	}

	// Rewrite Arguments
	node.value.arguments = ARGUMENTS_ORDER[ translateFunction ].map(
		( key ) => parsedArguments[ key ]
	);

	return node.value;
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
			.replaceWith( ( node ) => replaceWithWordpressI18nCall( node, j ) );
	} );

	// print
	return root.toSource();
};
