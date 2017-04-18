/**
 * Find the node containing the docblock
 * for a function given its name
 *
 * JSDoc function comments are attached to AST nodes
 * in a JavaScript file but these aren't always with
 * the direct nodes defining the functions.
 *
 * For example, if a function is exported such as
 * below we end up with this comment being associated
 * with the export declaration and the function itself
 * is a child of the export declaration node.
 *
 * Therefore we need to find the "outermost" node onto
 * which an associated docblock could be attached for
 * a function of the given name.
 *
 * @see http://eslint.org/parser/ or similar tool for an interactive AST explorer
 *
 * Find these types of occurrences:
 *  - `export function noop() {}` -> Return the export declaration
 *  - `export const noop = function() {}` -> Return the export declaration
 *  - `export const noop = () => {}` -> Return the export declaration
 *  - `function noop() {}` -> Return the function declaration
 *  - `const noop = function() {}` -> Return the variable declaration
 *  - `const noop = () => {}` -> Return the variable declaration
 *
 * @param {Object} ast an espree-generated AST
 * @param {String} name name of function for associated docblock
 * @returns {?Object} AST node containing block comment if exists
 */
export const findOutermostNode = ( ast, name ) =>
	ast && ast.body && ast.body.find( ( { declaration, declarations, id, type } ) => (
		(
			type === 'ExportNamedDeclaration' &&
			(
				(
					declaration.type === 'FunctionDeclaration' &&
					declaration.id.name === name
				) ||
				(
					declaration.type === 'VariableDeclaration' &&
					declaration.declarations &&
					declaration.declarations[ 0 ] &&
					declaration.declarations[ 0 ].id.name === name &&
					(
						declaration.declarations[ 0 ].init.type === 'FunctionExpression' ||
						declaration.declarations[ 0 ].init.type === 'ArrowFunctionExpression' ||
						declaration.declarations[ 0 ].init.type === 'CallExpression'
					)
				)
			)
		) ||
		(
			type === 'VariableDeclaration' &&
			(
				declarations[ 0 ] &&
				declarations[ 0 ].type === 'VariableDeclarator' &&
				declarations[ 0 ].id.name === name &&
				(
					declarations[ 0 ].init.type === 'FunctionExpression' ||
					declarations[ 0 ].init.type === 'ArrowFunctionExpression' ||
					declarations[ 0 ].init.type === 'CallExpression'
				)
			)
		) ||
		(
			type === 'FunctionDeclaration' &&
			id.name === name
		)
	) ) || null;

/**
 * Returns the attached docblock comment of a given node
 *
 * @param {Object} node an espree-generated AST node
 * @returns {?String} comment of attached node if present
 */
export const getComment = node =>
	( node.leadingComments && node.leadingComments[ 0 ].type === 'Block' )
		? node.leadingComments[ 0 ].value
		: null;
