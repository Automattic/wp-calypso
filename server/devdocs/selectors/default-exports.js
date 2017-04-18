/**
 * Internal dependencies
 */
import { findOutermostNode } from './function-comments';

export const defaultExport = ast =>
	ast && ast.body && ast.body.find(
		( { type } ) => type === 'ExportDefaultDeclaration'
	) || null;

export const defaultFunction = ast => {
	const item = defaultExport( ast );
	const type = item && item.declaration && item.declaration.type;

	if ( ! ( item && type ) ) {
		return null;
	}

	if ( 'FunctionDeclaration' === type ) {
		return item;
	}

	if ( 'ArrowFunctionExpression' === type ) {
		return item;
	}

	if ( 'Identifier' === type ) {
		return findOutermostNode( ast, item.declaration.name );
	}

	if ( 'CallExpression' === type ) {
		return findOutermostNode( ast, item.declaration.callee.name );
	}

	return null;
};
