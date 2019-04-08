/** @format */

// This code combines the Mochawesome and xunit outputs with a dynamically allocated directory for xunit output

/**
 * Module dependencies.
 */

const mocha = require( 'mocha' );
const mochawesome = require( 'mochawesome' );
const XUnit = mocha.reporters.XUnit;
const utils = mocha.utils;
const inherits = utils.inherits;

let reportDir = './reports';

if ( process.env.TEMP_ASSET_PATH ) {
	reportDir = `${ process.env.TEMP_ASSET_PATH }/reports`;
}
const reportName = reportDir + '/xunit_' + new Date().getTime().toString() + '.xml';

/**
 * Expose `SpecXUnit`.
 */

exports = module.exports = MochawesomeXUnit;

/**
 * Initialize a new `MochawesomeXUnit` test reporter.
 *
 * @api public
 * @param {Runner} runner Test runner object, handled implicitly by mocha
 */
function MochawesomeXUnit( runner ) {
	mochawesome.call( this, runner, {
		reporterOptions: {
			overwrite: false,
			html: false,
			json: true,
			reportDir: 'ma-reports',
		},
	} );
	XUnit.call( this, runner, { reporterOptions: { output: reportName } } );
}

/**
 * Inherit from Spec and XUnit prototypes.
 */
inherits( MochawesomeXUnit, mochawesome );
inherits( MochawesomeXUnit, XUnit );
