const argv = require( 'yargs' ).argv;
const _ = require( 'lodash' );

const [ basename, murielname ] = argv._;

const steps = [ 0, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900 ];
const variants = _.map( steps, variant => {
	return `--${ basename }-${ variant }: #{ \$muriel-color-${ murielname }-${ variant } };`;
} );

variants.unshift( `--${ basename }-light: #{ \$muriel-color-${ murielname }-300 };` );
variants.unshift( `--${ basename }-dark: #{ \$muriel-color-${ murielname }-700 };` );
variants.unshift( `--${ basename }: #{ \$muriel-color-${ murielname }-500 };` );

variants.forEach( n => console.log( n ) );
