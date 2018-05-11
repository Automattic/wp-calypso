/** @format */

import config from 'config';
import { kebabCase } from 'lodash';

export default function transformer( file, api ) {
	const j = api.jscodeshift;

	return j( file.source )
		.find( j.ImportDeclaration )
		.filter( p => p.node.source.value === 'state/selectors' )
		.forEach( path => {
			path.node.specifiers
				.map( s => [ s.imported.name, s.local.name ] )
				.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
				.map( ( [ name, alias ] ) =>
					j.importDeclaration(
						[ j.importSpecifier( j.identifier( 'default' ), j.identifier( alias ) ) ],
						j.stringLiteral( `state/selectors/${ kebabCase( name ) }` )
					)
				)
				.forEach( i => j( path ).insertBefore( i ) );

			j( path ).remove();
		} )
		.toSource( config.recastOptions );
}
