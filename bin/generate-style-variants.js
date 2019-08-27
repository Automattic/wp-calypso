const argv = require( 'yargs' ).argv;
const _ = require( 'lodash' );

const [ baseName, murielName ] = argv._;

const steps = [
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
const stepValues = [
	'500',
	'700',
	'300',
	'0',
	'50',
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'700',
	'800',
	'900',
];

const variants = _.flatMap( steps, ( step, stepIndex ) => {
	const propertyName = _.compact( [ '--color', baseName, step ] ).join( '-' );
	const variableName = _.compact( [ '$muriel', murielName, stepValues[ stepIndex ] ] ).join( '-' );

	return [
		`${ propertyName }: #{${ variableName }};`,
		`${ propertyName }-rgb: #{hex-to-rgb( ${ variableName } )};`,
	];
} );

variants.forEach( n => console.log( n ) );
