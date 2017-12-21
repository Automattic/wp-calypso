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

	return {
		name: 'action-type-inliner',
		visitor: {
			ImportDeclaration( path, state ) {
				if ( path.node.source.value !== 'state/action-types' ) {
					return path.skip();
				}

				const filename = state.file.opts.filename;

				const myTypes = path.node.specifiers.filter( t.isImportSpecifier ).reduce( ( o, n ) => {
					o[ n.local.name ] = n.imported.name;
					return o;
				}, {} );

				path.parentPath.traverse( replacer, { myTypes } );

				path.remove();
			},
		},
	};
}

module.exports = transformIt;
