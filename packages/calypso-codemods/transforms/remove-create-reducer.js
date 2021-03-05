function arrowFunctionBodyToCase( j, test, body ) {
	if ( body.type === 'BlockStatement' ) {
		return j.switchCase( test, [ body ] );
	}
	return j.switchCase( test, [ j.returnStatement( body ) ] );
}

function getCases( j, handlerMap ) {
	let hasPersistence = false;

	const cases = handlerMap.properties.map( ( actionNode ) => {
		const test = actionNode.computed
			? actionNode.key
			: j.literal( actionNode.key.name || String( actionNode.key.value ) );
		const fn = actionNode.value;

		if (
			test.type === 'Identifier' &&
			( test.name === 'SERIALIZE' || test.name === 'DESERIALIZE' )
		) {
			hasPersistence = true;
		}

		if (
			test.type === 'Literal' &&
			( test.value === 'SERIALIZE' || test.value === 'DESERIALIZE' )
		) {
			hasPersistence = true;
		}

		// If it's an arrow function without parameters, just return the body.
		if ( fn.type === 'ArrowFunctionExpression' && fn.params.length === 0 ) {
			return arrowFunctionBodyToCase( j, test, fn.body );
		}

		// If it's an arrow function with the right parameter names, just return the body.
		if (
			fn.type === 'ArrowFunctionExpression' &&
			fn.params[ 0 ].name === 'state' &&
			( fn.params.length === 1 || ( fn.params.length === 2 && fn.params[ 1 ].name === 'action' ) )
		) {
			return arrowFunctionBodyToCase( j, test, fn.body );
		}

		// If it's an arrow function with a deconstructed action, do magic.
		if (
			fn.type === 'ArrowFunctionExpression' &&
			fn.params[ 0 ].name === 'state' &&
			fn.params.length === 2 &&
			fn.params[ 1 ].type === 'ObjectPattern'
		) {
			const declaration = j.variableDeclaration( 'const', [
				j.variableDeclarator( fn.params[ 1 ], j.identifier( 'action' ) ),
			] );
			const prevBody =
				fn.body.type === 'BlockStatement' ? fn.body.body : [ j.returnStatement( fn.body ) ];
			const body = j.blockStatement( [ declaration, ...prevBody ] );
			return arrowFunctionBodyToCase( j, test, body );
		}

		return j.switchCase( test, [
			j.returnStatement(
				j.callExpression( actionNode.value, [ j.identifier( 'state' ), j.identifier( 'action' ) ] )
			),
		] );
	} );

	return { cases, hasPersistence };
}

function handlePersistence( j, createReducerPath, newNode ) {
	const parent = createReducerPath.parentPath;
	const grandParentValue =
		parent &&
		parent.parentPath.value &&
		parent.parentPath.value.length === 1 &&
		parent.parentPath.value[ 0 ];
	const greatGrandParent =
		grandParentValue && parent && parent.parentPath && parent.parentPath.parentPath;

	if (
		parent &&
		grandParentValue &&
		greatGrandParent &&
		parent.value.type === 'VariableDeclarator' &&
		grandParentValue.type === 'VariableDeclarator' &&
		greatGrandParent.value.type === 'VariableDeclaration'
	) {
		const varName = parent.value.id.name;
		const persistenceNode = j.expressionStatement(
			j.assignmentExpression(
				'=',
				j.memberExpression(
					j.identifier( varName ),
					j.identifier( 'hasCustomPersistence' ),
					false
				),
				j.literal( true )
			)
		);

		if ( greatGrandParent.parentPath.value.type === 'ExportNamedDeclaration' ) {
			// Handle `export const reducer = ...` case.
			greatGrandParent.parentPath.insertAfter( persistenceNode );
		} else {
			// Handle `const reducer = ...` case.
			greatGrandParent.insertAfter( persistenceNode );
		}
	} else if ( parent && parent.value.type === 'AssignmentExpression' ) {
		const persistenceNode = j.expressionStatement(
			j.assignmentExpression(
				'=',
				j.memberExpression( parent.value.left, j.identifier( 'hasCustomPersistence' ), false ),
				j.literal( true )
			)
		);
		parent.parentPath.insertAfter( persistenceNode );
	} else {
		newNode.comments = newNode.comments || [];
		newNode.comments.push( j.commentLine( ' TODO: HANDLE PERSISTENCE', true, false ) );
	}

	return newNode;
}

export default function transformer( file, api ) {
	const j = api.jscodeshift;

	const root = j( file.source );

	let usedWithoutPersistence = false;

	// Handle createReducer
	root
		.find(
			j.CallExpression,
			( node ) => node.callee.type === 'Identifier' && node.callee.name === 'createReducer'
		)
		.forEach( ( createReducerPath ) => {
			if ( createReducerPath.value.arguments.length !== 2 ) {
				throw new Error( 'Unable to translate createReducer' );
			}

			const [ defaultState, handlerMap ] = createReducerPath.value.arguments;

			const { cases, hasPersistence } = getCases( j, handlerMap );

			let newNode = j.arrowFunctionExpression(
				[ j.assignmentPattern( j.identifier( 'state' ), defaultState ), j.identifier( 'action' ) ],

				j.blockStatement( [
					j.switchStatement(
						j.memberExpression( j.identifier( 'action' ), j.identifier( 'type' ) ),
						cases
					),
					j.returnStatement( j.identifier( 'state' ) ),
				] )
			);

			if ( hasPersistence ) {
				newNode = handlePersistence( j, createReducerPath, newNode );
			} else {
				usedWithoutPersistence = true;
				newNode = j.callExpression( j.identifier( 'withoutPersistence' ), [ newNode ] );
			}

			createReducerPath.replace( newNode );
		} );

	// Handle createReducerWithValidation
	root
		.find(
			j.CallExpression,
			( node ) =>
				node.callee.type === 'Identifier' && node.callee.name === 'createReducerWithValidation'
		)
		.forEach( ( createReducerPath ) => {
			if ( createReducerPath.value.arguments.length !== 3 ) {
				throw new Error( 'Unable to translate createReducerWithValidation' );
			}

			const [ defaultState, handlerMap, schema ] = createReducerPath.value.arguments;

			const { cases } = getCases( j, handlerMap );

			const newNode = j.callExpression( j.identifier( 'withSchemaValidation' ), [
				schema,
				j.arrowFunctionExpression(
					[
						j.assignmentPattern( j.identifier( 'state' ), defaultState ),
						j.identifier( 'action' ),
					],

					j.blockStatement( [
						j.switchStatement(
							j.memberExpression( j.identifier( 'action' ), j.identifier( 'type' ) ),
							cases
						),
						j.returnStatement( j.identifier( 'state' ) ),
					] )
				),
			] );

			createReducerPath.replace( newNode );
		} );

	// Handle imports.
	root
		.find(
			j.ImportDeclaration,
			( node ) =>
				node.specifiers &&
				node.specifiers.some(
					( s ) =>
						s &&
						s.imported &&
						( s.imported.name === 'createReducer' ||
							s.imported.name === 'createReducerWithValidation' )
				)
		)
		.forEach( ( nodePath ) => {
			const filtered = nodePath.value.specifiers.filter(
				( s ) =>
					s.imported.name !== 'createReducer' && s.imported.name !== 'createReducerWithValidation'
			);

			if (
				nodePath.value.specifiers.find( ( s ) => s.imported.name === 'createReducerWithValidation' )
			) {
				if ( ! filtered.find( ( s ) => s.imported.name === 'withSchemaValidation' ) ) {
					filtered.push(
						j.importSpecifier(
							j.identifier( 'withSchemaValidation' ),
							j.identifier( 'withSchemaValidation' )
						)
					);
				}
			}

			if ( usedWithoutPersistence ) {
				if ( ! filtered.find( ( s ) => s.imported.name === 'withoutPersistence' ) ) {
					filtered.push(
						j.importSpecifier(
							j.identifier( 'withoutPersistence' ),
							j.identifier( 'withoutPersistence' )
						)
					);
				}
			}

			if ( filtered.length === 0 ) {
				const { comments } = nodePath.node;
				const { parentPath } = nodePath;
				const nextNode = parentPath.value[ nodePath.name + 1 ];
				j( nodePath ).remove();
				nextNode.comments = comments;
			} else {
				nodePath.value.specifiers = filtered;
			}
		} );

	return root.toSource();
}
