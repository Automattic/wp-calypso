import config from './config';
import { kebabCase } from 'lodash';

export default function transformer( file, api ) {
	const j = api.jscodeshift;

	return j( file.source )
		.find( j.ImportDeclaration )
		.filter( ( p ) => p.node.source.value === 'state/selectors' )
		.forEach( ( path ) => {
			path.node.specifiers
				.map( ( s ) => [ s.imported.name, s.local.name ] )
				.sort( ( a, b ) => a[ 0 ].localeCompare( b[ 0 ] ) )
				.map( ( [ name, alias ], i ) => ( {
					...j.importDeclaration(
						[ j.importDefaultSpecifier( j.identifier( alias ) ) ],
						j.stringLiteral( `state/selectors/${ kebabCase( name ) }` )
					),
					...( i === 0 ? { comments: path.node.comments } : {} ),
				} ) )
				.forEach( ( i ) => j( path ).insertBefore( i ) );

			j( path ).remove();
		} )
		.toSource( config.recastOptions );
}
