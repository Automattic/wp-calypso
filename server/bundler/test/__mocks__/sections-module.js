const getSectionsModule = require( '../../loader-utils' ).getSectionsModule;

const sections = require( '../fixtures' ).sections;
const codeSplitting = false;

const moduleStringWithoutImports = getSectionsModule( sections, codeSplitting ).replace( /import\(/gi, 'fakeImport(' );

module.exports = new Function( 'require', 'module', moduleStringWithoutImports );
