module.exports = function ( fileInfo, api ) {
	const j = api.jscodeshift;
	const root = j( fileInfo.source );

	const functionMappings = {
		numberFormat: 'formatNumber',
		numberFormatCompact: 'formatNumberCompact',
		formatCurrency: 'formatCurrency',
		getCurrencyObject: 'getCurrencyObject',
	};

	// Find imports from i18n-calypso
	const i18nImports = root.find( j.ImportDeclaration, {
		source: { value: 'i18n-calypso' },
	} );

	console.log( 'Found i18n imports:', i18nImports.length );

	let hasNumberFormatters = false;
	const importsToAdd = new Set();

	// First pass: collect all imports to add and mark specifiers for removal
	i18nImports.forEach( ( path ) => {
		console.log(
			'Processing import with specifiers:',
			path.value.specifiers.map( ( s ) => s.imported?.name || s.local?.name ).filter( Boolean )
		);
		const specifiersToKeep = [];
		path.value.specifiers.forEach( ( specifier ) => {
			if (
				specifier.type === 'ImportSpecifier' &&
				specifier.imported &&
				functionMappings.hasOwnProperty( specifier.imported.name )
			) {
				console.log( 'Found number formatter:', specifier.imported.name );
				hasNumberFormatters = true;
				importsToAdd.add( functionMappings[ specifier.imported.name ] );
			} else {
				specifiersToKeep.push( specifier );
			}
		} );
		path.value.specifiers = specifiersToKeep;
	} );

	console.log( 'Has number formatters:', hasNumberFormatters );
	console.log( 'Imports to add:', Array.from( importsToAdd ) );

	// Second pass: remove empty imports
	i18nImports.forEach( ( path ) => {
		if ( path.value.specifiers.length === 0 ) {
			j( path ).remove();
		}
	} );

	if ( hasNumberFormatters ) {
		// Add import for @automattic/number-formatters at the top
		const importStatement = j.importDeclaration(
			Array.from( importsToAdd )
				.sort()
				.map( ( name ) => j.importSpecifier( j.identifier( name ) ) ),
			j.literal( '@automattic/number-formatters' )
		);

		// Add the new import at the top
		root.get().node.program.body.unshift( importStatement );

		// Replace function calls
		Object.entries( functionMappings ).forEach( ( [ oldName, newName ] ) => {
			const identifiers = root.find( j.Identifier, { name: oldName } ).filter( ( path ) => {
				// Only replace if it's a function call
				const parent = path.parent.value;
				return parent.type === 'CallExpression' || parent.type === 'MemberExpression';
			} );
			console.log( `Found ${ identifiers.length } identifiers for ${ oldName }` );
			identifiers.forEach( ( path ) => {
				j( path ).replaceWith( j.identifier( newName ) );
			} );
		} );
	}

	return root.toSource( { quote: 'single' } );
};
