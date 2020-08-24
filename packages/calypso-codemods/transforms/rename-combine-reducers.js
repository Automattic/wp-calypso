/**
 * This codemod updates
 *
 * import { combineReducersWithPersistence } from 'state/utils'; to
 * import { combineReducers } from 'state/utils';
 *
 * and updates
 *
 * combineReducersWithPersistence( {
 *    foo,
 *    bar
 * } );
 *
 * to
 *
 * combineReducers( {
 *   foo,
 *   bar
 * } );
 */

module.exports = function ( file, api ) {
	// alias the jscodeshift API
	const j = api.jscodeshift;
	// parse JS code into an AST
	const root = j( file.source );

	const importNames = [];

	const combineReducerImport = root
		.find( j.ImportDeclaration, {
			source: {
				type: 'Literal',
				value: 'state/utils',
			},
		} )
		.filter( ( importDeclaration ) => {
			if ( importDeclaration.value.specifiers.length > 0 ) {
				return (
					importDeclaration.value.specifiers.filter( ( specifier ) => {
						const importedName = specifier.imported.name;
						const localName = specifier.local.name;
						const shouldRename = importedName === 'combineReducersWithPersistence';
						importNames.push( {
							local: localName === 'combineReducersWithPersistence' ? 'combineReducers' : localName,
							imported: shouldRename ? 'combineReducers' : importedName,
						} );
						return shouldRename;
					} ).length > 0
				);
			}
			return false;
		} );

	if ( ! combineReducerImport.length ) {
		return;
	}

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

	//save the comment if possible
	const comments = combineReducerImport.at( 0 ).get().node.comments;
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

	combineReducerImport.replaceWith( addImport( importNames ) );

	//update combineReducers call
	const renameIdentifier = ( newName ) => ( imported ) => {
		j( imported ).replaceWith( () => j.identifier( newName ) );
	};
	const combineReducerIdentifier = root
		.find( j.CallExpression )
		.find( j.Identifier )
		.filter( ( identifier ) => identifier.value.name === 'combineReducersWithPersistence' );

	combineReducerIdentifier.forEach( renameIdentifier( 'combineReducers' ) );

	// print
	return root.toSource();
};
