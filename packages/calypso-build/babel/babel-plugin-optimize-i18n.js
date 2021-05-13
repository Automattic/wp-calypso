const i18nImports = new Set( [ '__', '_n', '_nx', '_x' ] );

module.exports = function ( babel ) {
	const { types: t } = babel;

	// Collects named imports from the "@wordpress/i18n" package
	function collectAllImportsAndAliasThem( path ) {
		const node = path.node;
		const aliases = [];
		if ( t.isStringLiteral( node.source ) && node.source.value === '@wordpress/i18n' ) {
			const specifiers = path.get( 'specifiers' );

			for ( const specifier of specifiers ) {
				if ( t.isImportSpecifier( specifier ) ) {
					const importedNode = specifier.node.imported;
					const localNode = specifier.node.local;

					if ( t.isIdentifier( importedNode ) && t.isIdentifier( localNode ) ) {
						if ( i18nImports.has( importedNode.name ) ) {
							aliases.push( {
								original: localNode.name,
								aliased: 'alias' + localNode.name,
							} );
							specifier.replaceWith(
								t.importSpecifier(
									t.identifier( 'alias' + localNode.name ),
									t.identifier( importedNode.name )
								)
							);
							path.scope.removeBinding( localNode.name );
						}
					}
				}
			}
			path.scope.registerDeclaration( path );
		}
		return aliases;
	}

	return {
		name: 'babel-plugin-optimize-i18n',
		visitor: {
			ImportDeclaration( path ) {
				const aliases = collectAllImportsAndAliasThem( path );
				if ( aliases.length > 0 ) {
					const declarations = aliases.map( ( { original, aliased } ) =>
						t.variableDeclarator( t.identifier( original ), t.identifier( aliased ) )
					);
					const aliasDeclarationNode = t.variableDeclaration( 'const', declarations );
					path.insertAfter( aliasDeclarationNode );

					const aliasDeclarationPath = path.getNextSibling();
					path.scope.registerDeclaration( aliasDeclarationPath );
				}
			},
		},
	};
};
