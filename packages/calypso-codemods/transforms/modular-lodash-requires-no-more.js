let j;

const getImports = ( source ) => {
	const imports = [];

	source.find( j.ImportDeclaration ).forEach( ( dec ) => imports.push( dec ) );

	return imports;
};

const getRequires = ( source ) => {
	const requires = [];

	source
		.find( j.VariableDeclarator, {
			init: {
				type: 'CallExpression',
				callee: {
					type: 'Identifier',
					name: 'require',
				},
			},
		} )
		.forEach( ( req ) => requires.push( req ) );

	return requires;
};

const getModularLodashDecs = ( requires ) =>
	requires.filter(
		( { value: { init } } ) =>
			init.type === 'CallExpression' &&
			init.callee.name === 'require' &&
			init.arguments.length &&
			init.arguments[ 0 ].value &&
			init.arguments[ 0 ].value.startsWith( 'lodash/' )
	);

const makeNewImports = ( decs ) => {
	const imports = [];

	decs.forEach( ( dec ) => {
		const local = dec.value.init.arguments[ 0 ].value.replace( 'lodash/', '' );
		const name = dec.value.id.name;

		const newImport = j.importDeclaration(
			[ j.importSpecifier( j.identifier( local ), j.identifier( name ) ) ],
			j.literal( 'lodash' )
		);

		imports.push( newImport );
	} );

	return imports;
};

const findInsertionPoint = ( imports, requires ) => {
	if ( ! imports.length ) {
		const declaration = requires[ 0 ].parentPath.parentPath;
		const isAnnotated =
			declaration.value.comments &&
			declaration.value.comments.length &&
			declaration.value.comments[ 0 ].value === '*\n * External dependencies\n ';

		return [ declaration, isAnnotated ? 'annotated-requires' : 'no-imports' ];
	}

	// see if we have an external import
	const externalAt = imports.findIndex(
		( dec ) =>
			dec.value.comments && dec.value.comments[ 0 ].value === '*\n * External dependencies\n '
	);

	if ( externalAt >= 0 ) {
		const internalAt = imports.findIndex(
			( dec ) =>
				dec.value.comments && dec.value.comments[ 0 ].value === '*\n * Internal dependencies\n '
		);

		// insertion point is at last external import
		// or just before first internal import
		return internalAt >= 0
			? [ imports[ internalAt ], 'before-internals' ]
			: [ imports[ imports.length - 1 ], 'no-internals' ];
	}

	// no externals, so put this at the top
	return [ imports[ 0 ], 'no-externals' ];
};

export default function transformer( file, api ) {
	j = api.jscodeshift;
	const source = j( file.source );

	const requires = getRequires( source );

	// if we don't have any requires
	// then don't do anything
	if ( ! requires.length ) {
		return file.source;
	}

	const decs = getModularLodashDecs( requires );

	// if we don't have any modular lodash requires
	// then don't do anything
	if ( ! decs.length ) {
		return file.source;
	}

	const imports = getImports( source );

	const newImports = makeNewImports( decs );

	const [ insertionPoint, status ] = findInsertionPoint( imports, requires );

	switch ( status ) {
		case 'no-imports':
		case 'no-externals':
			newImports[ 0 ].comments = [ j.commentBlock( '*\n * External dependencies\n ' ) ];
			j( insertionPoint ).insertBefore( newImports );
			break;
		case 'annotated-requires':
			newImports[ 0 ].comments = insertionPoint.value.comments;
			insertionPoint.value.comments = [];
		case 'before-internals':
			j( insertionPoint ).insertBefore( newImports );
			break;
		case 'no-internals':
			j( insertionPoint ).insertAfter( newImports );
			break;
	}

	// remove the old ones
	j( decs ).remove();

	return source.toSource();
}
