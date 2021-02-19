// This code combines the Mocha spec and junit outputs with a dynamically allocated directory for junit output

/**
 * Module dependencies.
 */
const mocha = require( 'mocha' );
const mochaJUnitReporter = require( 'mocha-junit-reporter' );
const Spec = mocha.reporters.Spec;
const utils = mocha.utils;
const inherits = utils.inherits;

let reportDir = './reports';

if ( process.env.TEMP_ASSET_PATH ) {
	reportDir = `${ process.env.TEMP_ASSET_PATH }/reports`;
}
const reportName = reportDir + '/junit_' + new Date().getTime().toString() + '.xml';

/**
 * Expose `SpecJUnit`.
 */

exports = module.exports = SpecJUnit;

/**
 * Initialize a new `SpecJUnit` test reporter.
 *
 * @param {object} runner Test runner object, handled implicitly by mocha
 */
function SpecJUnit( runner ) {
	new mochaJUnitReporter( runner, { reporterOptions: { mochaFile: reportName } } );
	Spec.call( this, runner );
}

/**
 * Inherit from Spec and JUnit prototypes.
 */
inherits( SpecJUnit, Spec );

