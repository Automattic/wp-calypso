/**
 * Merges multiple lodash imports into a single statement
 *
 * @example
 * // input
 * import { zip } from 'lodash';
 * import { map } from 'lodash';
 * import { pick } from 'lodash';
 *
 * // output
 * import { map, pick, zip } from 'lodash'
 *
 * @param file
 * @param api
 * @returns {string}
 */

export default function transformer( file, api ) {
	const specSorter = ( a, b ) => a.imported.name.localeCompare( b.imported.name );

	const j = api.jscodeshift;

	const source = j( file.source );
	const lodash = new Set();
	const decs = [];
	const maps = new Map();

	const sourceDecs = source.find( j.ImportDeclaration, {
		source: { value: 'lodash' },
	} );

	// bail if we only have a single declaration
	if ( sourceDecs.nodes().length === 1 ) {
		return file.source;
	}

	sourceDecs.forEach( ( dec ) => {
		decs.push( dec );
		j( dec )
			.find( j.ImportSpecifier )
			.forEach( ( spec ) => {
				const local = spec.value.local.name;
				const name = spec.value.imported.name;

				if ( local === name ) {
					lodash.add( name );
				} else {
					maps.set( name, ( maps.get( name ) || new Set() ).add( local ) );
				}
			} );
	} );

	// Insert new statement above first existing lodash import
	if ( decs.length ) {
		const newSpecs = Array.from( lodash ).map( ( name ) =>
			j.importSpecifier( j.identifier( name ), j.identifier( name ) )
		);

		// start adding renamed imports
		const renames = [];
		maps.forEach( ( localSet, name ) => {
			const locals = Array.from( localSet );
			const hasDefault = lodash.has( name );
			const topName = hasDefault ? name : locals[ 0 ];

			// add first renamed import if no default
			// already exists in import statement
			if ( ! hasDefault ) {
				locals.shift();
				newSpecs.push( j.importSpecifier( j.identifier( name ), j.identifier( topName ) ) );
			}

			// add remaining renames underneath
			locals.forEach( ( local ) => {
				const rename = j.variableDeclaration( 'const', [
					j.variableDeclarator( j.identifier( local ), j.identifier( topName ) ),
				] );

				renames.push( rename );
			} );
		} );

		// sort and insert…
		const newImport = j.importDeclaration( newSpecs.sort( specSorter ), j.literal( 'lodash' ) );
		newImport.comments = decs[ 0 ].value.comments;
		j( decs[ 0 ] ).insertBefore( [ newImport, ...renames ] );
	}

	// remove old declarations
	decs.forEach( ( dec ) => j( dec ).remove() );

	return source.toSource();
}
