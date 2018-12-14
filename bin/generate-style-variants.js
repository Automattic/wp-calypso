const argv = require( 'yargs' ).argv;
const _ = require( 'lodash' );

const [ basename, murielname ] = argv._;

const variants = _.times( 10, num => {
	const variant = num === 0 ? 50 : num * 100;
	return `--${ basename }-${ variant }: #{ \$muriel-color-${ murielname }-${ variant } };`;
} );

variants.unshift( `--${ basename }-light: #{ \$muriel-color-${ murielname }-300 };` );
variants.unshift( `--${ basename }-dark: #{ \$muriel-color-${ murielname }-700 };` );
variants.unshift( `--${ basename }: #{ \$muriel-color-${ murielname }-500 };` );

variants.forEach( n => console.log( n ) );
