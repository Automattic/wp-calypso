/*
 This codemod updates

 import { combineReducers } from 'redux'; to
 import { combineReducers } from 'state/utils';
 */

module.exports = function ( file, api ) {
	// alias the jscodeshift API
	const j = api.jscodeshift;
	// parse JS code into an AST
	const root = j( file.source );

	//remove combineReducer import
	const combineReducerImport = root
		.find( j.ImportDeclaration, {
			source: {
				type: 'Literal',
				value: 'redux',
			},
		} )
		.filter( ( importDeclaration ) => {
			if ( importDeclaration.value.specifiers.length === 1 ) {
				return importDeclaration.value.specifiers[ 0 ].imported.name === 'combineReducers';
			}
			return false;
		} );

	if ( ! combineReducerImport.length ) {
		return;
	}

	combineReducerImport.remove();

	// find the first external import
	const firstInternalImport = root.find( j.ImportDeclaration ).filter( ( item ) => {
		if ( item.node.comments && item.node.comments.length > 0 ) {
			return item.node.comments[ 0 ].value.match( /Internal dependencies/ );
		}
		return false;
	} );

	const combineReducersImport = () => {
		return j.importDeclaration(
			[ j.importSpecifier( j.identifier( 'combineReducers' ) ) ],
			j.literal( 'state/utils' )
		);
	};
	//note the extra whitespace coming from https://github.com/benjamn/recast/issues/371
	firstInternalImport.insertAfter( combineReducersImport );

	// print
	return root.toSource();
};
