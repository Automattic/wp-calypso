const argv = require( 'yargs' ).argv;
const _ = require( 'lodash' );

const [ baseName, colorName ] = argv._;

const suffixes = [
	'',
	'dark',
	'light',
	'0',
	'5',
	'10',
	'20',
	'30',
	'40',
	'50',
	'60',
	'70',
	'80',
	'90',
	'100',
];

suffixes.forEach( ( suffix ) => {
	const propertyName = _.compact( [ '--color', baseName, suffix ] ).join( '-' );
	const variableName = _.compact( [ '--studio', colorName, determineShadeIndex( suffix ) ] ).join(
		'-'
	);

	printEntry( propertyName, variableName );
	printEntry( propertyName + '-rgb', variableName + '-rgb' );
} );

function determineShadeIndex( suffix ) {
	switch ( suffix ) {
		case '':
			return '50';
		case 'dark':
			return '70';
		case 'light':
			return '30';
		default:
			return String( suffix );
	}
}

function printEntry( propertyName, variableName ) {
	console.log( `${ propertyName }: var( ${ variableName } );` );
}
