const { writeFileSync } = require( 'fs' );
const { renderSync } = require( 'node-sass' );
const packageImporter = require( 'node-sass-package-importer' );

const INPUT_FILE = 'src/custom-properties.scss';
const OUTPUT_FILE = 'dist/custom-properties.css';

const output = renderSync( { file: INPUT_FILE, importer: packageImporter() } );
writeFileSync( OUTPUT_FILE, output.css );
