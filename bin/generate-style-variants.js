const argv = require( 'yargs' ).argv;
const _ = require( 'lodash' );

const [ basename, murielname ] = argv._;

const steps = [ 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 ];
const variants = _.flatMap( steps, variant => {
	return [
		`--${ basename }-${ variant }: #{ \$muriel-${ murielname }-${ variant } };`,
		`--${ basename }-${ variant }-rgb: #{ hex-to-rgb( \$muriel-${ murielname }-${ variant } ) };`,
	];
} );

variants.unshift( `--${ basename }-light-rgb: #{ hex-to-rgb( \$muriel-${ murielname }-300 ) };` );
variants.unshift( `--${ basename }-light: #{ \$muriel-${ murielname }-300 };` );
variants.unshift( `--${ basename }-dark-rgb: #{ hex-to-rgb( \$muriel-${ murielname }-700 ) };` );
variants.unshift( `--${ basename }-dark: #{ \$muriel-${ murielname }-700 };` );
variants.unshift( `--${ basename }-rgb: #{ hex-to-rgb( \$muriel-${ murielname }-500 ) };` );
variants.unshift( `--${ basename }: #{ \$muriel-${ murielname }-500 };` );

variants.forEach( n => console.log( n ) );
