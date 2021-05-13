export default function transformer( file, api ) {
	const j = api.jscodeshift;
	const ReactUtils = require( 'react-codemod/transforms/utils/ReactUtils' )( j );
	const root = j( file.source );
	let foundMixinUsage = false;

	const createClassesInstances = ReactUtils.findAllReactCreateClassCalls( root );

	// Find the declaration to wrap with the localize HOC. It can be the React.createClass
	// itself, or an 'export default' or 'module.exports =' declaration, if present.
	function findDeclarationsToWrap( createClassInstance ) {
		// Is the created class being assigned to a variable?
		const parentNode = createClassInstance.parentPath.value;
		if ( parentNode.type !== 'VariableDeclarator' || parentNode.id.type !== 'Identifier' ) {
			return j( createClassInstance );
		}

		// AST matcher for the class identifier
		const classIdentifier = {
			type: 'Identifier',
			name: parentNode.id.name,
		};

		// AST matcher for the connected class identifier
		const connectedClassIdentifier = {
			type: 'CallExpression',
			callee: {
				type: 'CallExpression',
				callee: {
					type: 'Identifier',
					name: 'connect',
				},
			},
			arguments: [ classIdentifier ],
		};

		// AST matcher for the module.exports expression
		const moduleExportsExpression = {
			type: 'MemberExpression',
			object: {
				type: 'Identifier',
				name: 'module',
			},
			property: {
				type: 'Identifier',
				name: 'exports',
			},
		};

		// Is the variable later exported with 'export default'?
		const exportDefaultDeclarations = root.find( j.ExportDefaultDeclaration, {
			declaration: classIdentifier,
		} );
		if ( exportDefaultDeclarations.size() ) {
			return exportDefaultDeclarations.map( ( d ) => d.get( 'declaration' ) );
		}

		// Is the variable later exported with 'export default connect()'?
		const exportDefaultConnectDeclarations = root.find( j.ExportDefaultDeclaration, {
			declaration: connectedClassIdentifier,
		} );
		if ( exportDefaultConnectDeclarations.size() ) {
			return exportDefaultConnectDeclarations.map( ( d ) =>
				d.get( 'declaration' ).get( 'arguments', 0 )
			);
		}

		// Is the variable later exported with 'module.exports ='?
		const moduleExportsDeclarations = root.find( j.AssignmentExpression, {
			left: moduleExportsExpression,
			right: classIdentifier,
		} );
		if ( moduleExportsDeclarations.size() ) {
			return moduleExportsDeclarations.map( ( d ) => d.get( 'right' ) );
		}

		// Is the variable later exported with 'module.exports = connect()'?
		const moduleExportsConnectDeclarations = root.find( j.AssignmentExpression, {
			left: moduleExportsExpression,
			right: connectedClassIdentifier,
		} );
		if ( moduleExportsConnectDeclarations.size() ) {
			return moduleExportsConnectDeclarations.map( ( d ) =>
				d.get( 'right' ).get( 'arguments', 0 )
			);
		}

		return j( createClassInstance );
	}

	createClassesInstances.forEach( ( createClassInstance ) => {
		const propertiesToModify = [ 'translate', 'moment', 'numberFormat' ];

		propertiesToModify.forEach( ( property ) => {
			const propertyInstances = j( createClassInstance ).find( j.MemberExpression, {
				object: { type: 'ThisExpression' },
				property: {
					type: 'Identifier',
					name: property,
				},
			} );

			propertyInstances.replaceWith( () =>
				j.memberExpression(
					j.memberExpression( j.thisExpression(), j.identifier( 'props' ) ),
					j.identifier( property )
				)
			);

			if ( propertyInstances.size() ) {
				foundMixinUsage = true;
			}
		} );

		if ( foundMixinUsage ) {
			const declarationsToWrap = findDeclarationsToWrap( createClassInstance );
			declarationsToWrap.replaceWith( ( decl ) => {
				return j.callExpression( j.identifier( 'localize' ), [ decl.value ] );
			} );
		}
	} );

	if ( foundMixinUsage ) {
		const i18nCalypsoImports = root.find( j.ImportDeclaration, {
			source: { value: 'i18n-calypso' },
		} );
		if ( i18nCalypsoImports.size() ) {
			const i18nCalypsoImport = i18nCalypsoImports.get();
			const localizeImport = j( i18nCalypsoImport ).find( j.ImportSpecifier, {
				local: {
					type: 'Identifier',
					name: 'localize',
				},
			} );
			if ( ! localizeImport.size() ) {
				i18nCalypsoImport.value.specifiers.push( j.importSpecifier( j.identifier( 'localize' ) ) );
			}
		} else {
			root
				.find( j.ImportDeclaration )
				.at( 0 )
				.insertAfter( 'import { localize } from "i18n-calypso";' );
		}
	}

	return root.toSource();
}
