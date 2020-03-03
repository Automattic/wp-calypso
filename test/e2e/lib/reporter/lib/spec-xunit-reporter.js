// This code combines the Mocha spec and xunit outputs with a dynamically allocated directory for xunit output

/**
 * Module dependencies.
 */

const mocha = require( 'mocha' );
const Spec = mocha.reporters.Spec;
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

exports = module.exports = SpecXUnit;

/**
 * Initialize a new `SpecXUnit` test reporter.
 *
 * @api public
 * @param {Runner} runner Test runner object, handled implicitly by mocha
 */
function SpecXUnit( runner ) {
	Spec.call( this, runner );
	XUnit.call( this, runner, { reporterOptions: { output: reportName } } );
}

/**
 * Inherit from Spec and XUnit prototypes.
 */
inherits( SpecXUnit, Spec );
inherits( SpecXUnit, XUnit );
