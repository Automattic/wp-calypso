/**
 * Transform all safely recognizable instances of _.get().
 * Conditions include:
 * - Must be imported in the form `import { get, ... } from 'lodash'` or `import { get as foo, ... } from 'lodash'`
 * - Must either not use a default parameter, or use a default parameter set to the `null` literal
 * - Must use a string literal or array expression as the path
 *
 * If at least one of the conditions is not met, the transformation will be dropped.
 *
 * In files with at least one successful transformation, the import is removed if no longer used.
 */

// Transform function.
export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const root = j( file.source );

	let getMethodName;
	let visitedGetCalls = 0;
	let modifiedGetCalls = 0;

	function debug( text ) {
		throw new Error( `${ file.path }: ${ text }` );
	}

	function partToLiteral( string ) {
		const partAsNumber = Number.parseInt( string, 10 );
		return j.literal( isNaN( partAsNumber ) ? string : partAsNumber );
	}

	function handleIdentifier( string ) {
		if ( string.match( /^[A-Za-z_]\w*$/ ) ) {
			return { computed: false, exp: j.identifier( string ) };
		}
		return { computed: true, exp: partToLiteral( string ) };
	}

	const lodashImports = root.find( j.ImportDeclaration, {
		source: {
			type: 'Literal',
			value: 'lodash',
		},
	} );

	// Look for imported `get` method.
	lodashImports.forEach( ( nodePath ) => {
		const specifier = nodePath.value.specifiers.find( ( s ) => s.imported.name === 'get' );
		if ( specifier ) {
			getMethodName = specifier.local.name;
		}
	} );

	if ( getMethodName ) {
		root
			.find(
				j.CallExpression,
				( node ) => node.callee.type === 'Identifier' && node.callee.name === getMethodName
			)
			.forEach( ( getPath ) => {
				try {
					visitedGetCalls += 1;

					const { length } = getPath.value.arguments;
					const [ object, path, defaultValue ] = getPath.value.arguments;

					const hasDefaultNull =
						length === 3 && defaultValue.type === 'Literal' && defaultValue.value === null;

					if ( length !== 2 && ! hasDefaultNull ) {
						return;
					}

					let pathElements;

					if ( path.type === 'Literal' && typeof path.value === 'string' ) {
						// String-based path
						pathElements = path.value
							.split( /[.[]/ )
							.filter( ( el ) => el !== '' )
							.map( ( el ) => {
								const part = el.replace( ']', '' );
								return handleIdentifier( part );
							} );

						// Special case for empty string.
						if ( path.value === '' ) {
							pathElements = [ { computed: false, exp: j.literal( '' ) } ];
						}
					} else if ( path.type === 'ArrayExpression' ) {
						// Array-based path
						pathElements = path.elements.map( ( el ) => {
							if ( el.type === 'Literal' ) {
								if ( typeof el.value === 'string' ) {
									return handleIdentifier( el.value );
								}
								return { computed: true, exp: el };
							}

							if ( el.type === 'Identifier' || j.Expression.check( el ) ) {
								return { computed: true, exp: el };
							}

							debug( `Unknown type for array path element: "${ el.type }"` );
						} );
					} else {
						// Unknown type for path
						if ( path.type === 'Literal' ) {
							debug( `Invalid literal for path: \`${ path.raw }\`` );
						}
						debug( `Invalid path type: ${ path.type }` );
					}

					if ( pathElements && pathElements.length >= 1 ) {
						let newNode = j.optionalMemberExpression( object, pathElements[ 0 ].exp );
						newNode.computed = pathElements[ 0 ].computed;
						for ( const element of pathElements.slice( 1 ) ) {
							const { exp: node, computed } = element;
							newNode = j.optionalMemberExpression( newNode, node );
							newNode.computed = computed;
						}

						if ( hasDefaultNull ) {
							newNode = j.logicalExpression( '??', newNode, defaultValue );
							newNode = j.parenthesizedExpression( newNode );
						}

						modifiedGetCalls += 1;
						getPath.replace( newNode );
					}
				} catch ( error ) {
					// If something fails, output the error and do nothing.
					// That will skip this get call and move on to the next.
					// eslint-disable-next-line no-console
					console.error( error );
				}
			} );
	}

	// Remove unused imports.
	if ( modifiedGetCalls === visitedGetCalls && modifiedGetCalls >= 1 ) {
		lodashImports.forEach( ( nodePath ) => {
			const specifiers = nodePath.value.specifiers;
			const specifier = specifiers.findIndex( ( s ) => s.imported.name === 'get' );

			if ( specifiers.length > 1 ) {
				// Only remove unused named import, if there are others.
				delete nodePath.value.specifiers[ specifier ];
			} else {
				// Remove the entire import, if there's nothing else.
				if ( nodePath.value.leadingComments && nodePath.value.leadingComments.length ) {
					// Preserve comments if the following node is an import too.
					const { leadingComments } = nodePath.node;
					const { parentPath } = nodePath;
					const nextNode = parentPath.value[ nodePath.name + 1 ];
					if (
						nextNode.type === 'ImportDeclaration' &&
						( ! nextNode.comments || nextNode.comments.length === 0 )
					) {
						nextNode.comments = leadingComments;
					}
				}
				nodePath.prune();
			}
		} );
	}

	return root.toSource();
}
