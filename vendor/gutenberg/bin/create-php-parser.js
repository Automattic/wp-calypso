#!/usr/bin/env node

const pegjs = require( 'pegjs' );
const phpegjs = require( 'phpegjs' );
const fs = require( 'fs' );
const path = require( 'path' );

const peg = fs.readFileSync( 'blocks/api/post.pegjs', 'utf8' );

const parser = pegjs.generate(
	peg,
	{
		plugins: [ phpegjs ],
		phpegjs: {
			parserNamespace: null,
			parserGlobalNamePrefix: 'Gutenberg_PEG_',
			mbstringAllowed: false,
		},
	}
);

fs.writeFileSync(
	path.join( __dirname, '..', 'lib', 'parser.php' ),
	parser
);
