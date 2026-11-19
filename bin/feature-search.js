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

function getFormattedFeatureString( set ) {
	if ( set === true ) {
		return chalk.green( set );
	}

	if ( set === false ) {
		return chalk.red( set );
	}

	if ( set === null ) {
		return chalk.yellow( '(not set)' );
	}

	return chalk.yellow( set );
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
			const setStr = getFormattedFeatureString( set );

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
	'a8c-for-agencies-development',
	'a8c-for-agencies-horizon',
	'a8c-for-agencies-stage',
	'a8c-for-agencies-production',
	'dashboard-development',
	'dashboard-horizon',
	'dashboard-stage',
	'dashboard-production',
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
	'\nThis script makes it easy to search for particular feature flags across config environments. It lists every flag whose name contains {flag-search}.'
) }

${ chalk.cyan( 'Example' ) }
${ chalk.bgBlue( '\tyarn feature-search plugin' ) }
	`;

	console.log( helpText );
	process.exit( 1 );
}

const searchTerm = process.argv[ 2 ];

const main = async () => {
	const results = {};

	// Find all of the matching flags in each config file.
	for ( const config of configs ) {
		const features = await getConfigFeatures( config );

		for ( const flag in features ) {
			if ( flag.includes( searchTerm ) ) {
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
