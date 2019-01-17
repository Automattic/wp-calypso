const { writeFileSync } = require( 'fs' );
const { renderSync } = require( 'node-sass' );

const INPUT_FILE = 'assets/stylesheets/custom-properties.scss';
const OUTPUT_FILE = 'public/custom-properties.css';

const output = renderSync( { file: INPUT_FILE } );
writeFileSync( OUTPUT_FILE, output.css );
