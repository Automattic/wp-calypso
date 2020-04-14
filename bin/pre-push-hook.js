#!/usr/bin/env node

const execSync = require( 'child_process' ).execSync;
const readline = require( 'readline-sync' );

console.log(
	'\nBy contributing to this project, you license the materials you contribute ' +
		'under the GNU General Public License v2 (or later). All materials must have ' +
		'GPLv2 compatible licenses — see docs/CONTRIBUTING.md for details.\n\n'
);

const currentBranch = execSync( 'git rev-parse --abbrev-ref HEAD' ).toString().trim();

if ( 'master' === currentBranch ) {
	if ( ! readline.keyInYN( "You're about to push !!![ master ]!!!, is that what you intended?" ) ) {
		process.exit( 1 );
	}
}
