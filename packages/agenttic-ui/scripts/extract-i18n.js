#!/usr/bin/env node

const { GettextExtractor, JsExtractors } = require( 'gettext-extractor' );
const path = require( 'path' );
const fs = require( 'fs' );

const outputDir = path.join( __dirname, '..', 'languages' );
const outputFile = path.join( outputDir, 'a8c-agenttic.pot' );

// Ensure output directory exists
if ( ! fs.existsSync( outputDir ) ) {
	fs.mkdirSync( outputDir, { recursive: true } );
}

// Create extractor instance
const extractor = new GettextExtractor();

// Add JavaScript/TypeScript extractors for WordPress i18n functions
const parser = extractor.createJsParser( [
	JsExtractors.callExpression( '__', {
		arguments: {
			text: 0,
			context: 1,
		},
	} ),
	JsExtractors.callExpression( '_x', {
		arguments: {
			text: 0,
			context: 1,
		},
	} ),
	JsExtractors.callExpression( '_n', {
		arguments: {
			text: 0,
			textPlural: 1,
			context: 2,
		},
	} ),
	JsExtractors.callExpression( '_nx', {
		arguments: {
			text: 0,
			textPlural: 1,
			context: 2,
		},
	} ),
] );

// Parse both packages using relative paths
parser.parseFilesGlob( 'packages/agenttic-client/src/**/*.{ts,tsx,js,jsx}' );
parser.parseFilesGlob( 'packages/agenttic-ui/src/**/*.{ts,tsx,js,jsx}' );

// Save POT file with proper WordPress headers
extractor.savePotFile( outputFile, {
	'Project-Id-Version': 'Agenttic',
	'Report-Msgid-Bugs-To': 'https://github.com/automattic/agenttic/issues',
	'Last-Translator': 'FULL NAME <EMAIL@ADDRESS>',
	'Language-Team': 'LANGUAGE <LL@li.org>',
	'MIME-Version': '1.0',
	'Content-Type': 'text/plain; charset=UTF-8',
	'Content-Transfer-Encoding': '8bit',
	'POT-Creation-Date': new Date()
		.toISOString()
		.replace( /\.\d{3}Z$/, '+00:00' ),
	'PO-Revision-Date': 'YEAR-MO-DA HO:MI+ZONE',
	'X-Generator': 'gettext-extractor',
	'X-Domain': 'a8c-agenttic',
} );

// Add copyright header to the POT file
const potContent = fs.readFileSync( outputFile, 'utf8' );
const copyrightHeader = `# Copyright (C) ${ new Date().getFullYear() } Automattic, Inc.
# This file is distributed under the GPL2.
`;
fs.writeFileSync( outputFile, copyrightHeader + potContent );

console.log( `Extracted i18n strings from both packages to ${ outputFile }` );
