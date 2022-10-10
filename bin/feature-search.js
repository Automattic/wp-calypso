#! /usr/env/bin node

const fs = require( 'fs' );
const chalk = require( 'chalk' );

async function getConfigFeatures( config ) {
	const file = `${ __dirname }/../config/${ config }.json`;
	const json = await fs.readFileSync( file, 'utf8' );
	const data = JSON.parse( json );

	return data.features;
}

function calcLongestConfig( result ) {
	const configLengths = result.map( ( item ) => ( item.config ? item.config.length : 0 ) );
	return Math.max( ...configLengths );
}

function getPadding( count ) {
	let padding = '';
	for ( let i = 0; i < count; i++ ) {
		padding += ' ';
	}

	return padding;
}

function sortResult( result ) {
	result.sort( ( a, b ) => {
		if ( a.config < b.config ) {
			return -1;
		}

		if ( a.config > b.config ) {
			return 1;
		}

		return 0;
	} );
}

function outputResults( results ) {
	const resultKeys = Object.keys( results ).sort();

	if ( resultKeys.length === 0 ) {
		console.log( 'No matching features found.' );
		return;
	}

	for ( const key of resultKeys ) {
		const result = results[ key ];
		const maxLength = calcLongestConfig( result );

		sortResult( result );

		console.log( chalk.white.bgBlue.bold( key ) );
		for ( const item of result ) {
			const { config, set } = item;
			const configStr = chalk.cyan( `\t${ config }:` );

			let setStr = '';
			if ( set === true ) {
				setStr = chalk.green( set );
			} else if ( set === false ) {
				setStr = chalk.red( set );
			} else {
				setStr = chalk.yellow( set );
			}

			console.log( `${ configStr }${ getPadding( maxLength - config.length + 5 ) }${ setStr }` );
		}
		console.log( '' );
	}
}

const configs = [
	'development',
	'jetpack-cloud-development',
	'jetpack-cloud-horizon',
	'jetpack-cloud-production',
	'jetpack-cloud-stage',
	'horizon',
	'production',
	'stage',
	'test',
	'wpcalypso',
];

if ( process.argv.length !== 3 ) {
	const helpText = `
${ chalk.yellow.bold( 'Usage: yarn feature-search {flag-search}' ) }
${ chalk.cyan(
	'\nThis script makes it easy to search for particular feature flags across config environments. The value of {flag-search} can be a simple string (letters and numbers, no special characters) or a valid regular expression.'
) }

${ chalk.cyan( 'Example: Searching by simple string' ) }
${ chalk.bgBlue( '\tyarn feature-search plugin' ) }

${ chalk.cyan( 'Example: Searching by regex' ) }
${ chalk.bgBlue( `\tyarn feature-search 'bundl(e|ing)'` ) }
	`;

	console.log( helpText );
	process.exit( 1 );
}

const searchRe = new RegExp( process.argv[ 2 ], 'g' );

const main = async () => {
	const results = {};

	// Find all of the matching flags in each config file.
	for ( const config of configs ) {
		const features = await getConfigFeatures( config );

		for ( const flag in features ) {
			if ( flag.match( searchRe ) ) {
				if ( ! results.hasOwnProperty( flag ) ) {
					results[ flag ] = [];
				}

				results[ flag ].push( {
					config,
					set: features[ flag ],
				} );
			}
		}
	}

	// Add any configs that aren't part of the result set because they didn't have a flag match.
	// This ensures that our output is the same for each flag.
	for ( const key in results ) {
		const knownConfigs = results[ key ].map( ( item ) => item.config );

		const missingConfigs = configs.filter( ( config ) => ! knownConfigs.includes( config ) );

		missingConfigs.forEach( ( missingConfig ) => {
			results[ key ].push( {
				config: missingConfig,
				set: null,
			} );
		} );
	}

	outputResults( results );
};

main();
