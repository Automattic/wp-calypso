/** @format */
function transformIt( babel ) {
	const { types: t } = babel;

	const replacer = {
		Identifier( path ) {
			if ( t.isImportSpecifier( path.parentPath ) ) {
				return path.skip();
			}

			const name = path.node.name;
			if ( ! this.myTypes.hasOwnProperty( name ) ) {
				return path.skip();
			}

			path.replaceWith( t.stringLiteral( this.myTypes[ name ] ) );
		},
	};

	const mergeImports = ( o, n ) => {
		o[ n.local.name ] = n.imported.name;
		return o;
	};

	return {
		name: 'action-type-inliner',
		visitor: {
			ImportDeclaration( path ) {
				const name = path.node.source.value;

				if ( name !== 'state/action-types' ) {
					return path.skip();
				}

				const myTypes = path.node.specifiers
					.filter( t.isImportSpecifier )
					.reduce( mergeImports, {} );

				path.parentPath.traverse( replacer, { myTypes } );

				path.remove();
			},
		},
	};
}

module.exports = transformIt;
