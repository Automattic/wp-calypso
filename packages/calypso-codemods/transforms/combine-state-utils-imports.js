/*
 This codemod updates

 import { createReducer } from 'state/utils';
 import { combineReducersWithPersistence as bar, baz } from 'state/utils'

 to

 import { baz, combineReducersWithPersistence as bar, createReducer } from 'state/utils';
 */

module.exports = function ( file, api ) {
	// alias the jscodeshift API
	const j = api.jscodeshift;
	// parse JS code into an AST
	const root = j( file.source );

	const stateUtilsImports = root.find( j.ImportDeclaration, {
		source: {
			type: 'Literal',
			value: 'state/utils',
		},
	} );

	if ( stateUtilsImports.length < 2 ) {
		return;
	}

	//grab each identifier
	const importNames = [];
	stateUtilsImports.find( j.ImportSpecifier ).forEach( ( item ) => {
		importNames.push( {
			local: item.value.local.name,
			imported: item.value.imported.name,
		} );
	} );

	//sort by imported name
	importNames.sort( ( a, b ) => {
		if ( a.imported < b.imported ) {
			return -1;
		}
		if ( a.imported > b.imported ) {
			return 1;
		}
		return 0;
	} );

	//Save Comment if possible
	const comments = stateUtilsImports.at( 0 ).get().node.comments;

	const addImport = ( imports ) => {
		const names = imports.map( ( name ) => {
			if ( name.local === name.imported ) {
				return j.importSpecifier( j.identifier( name.local ) );
			}
			if ( name.local !== name.imported ) {
				return j.importSpecifier( j.identifier( name.imported ), j.identifier( name.local ) );
			}
		} );
		const combinedImport = j.importDeclaration( names, j.literal( 'state/utils' ) );
		combinedImport.comments = comments;
		return combinedImport;
	};

	//replace the first one with the combined import
	stateUtilsImports.at( 0 ).replaceWith( addImport( importNames ) );
	//remove the rest
	for ( let i = 1; i < stateUtilsImports.length; i++ ) {
		stateUtilsImports.at( i ).remove();
	}

	// print
	return root.toSource();
};
