#!/usr/bin/env node

/**
 * Runs before `yarn build` in `yarn start` so the console isn’t silent during the workspace build.
 */

const chalk = require( 'chalk' );

if ( process.env.CI === 'true' ) {
	process.exit( 0 );
}

console.log( chalk.hex( '#21759b' )( '\n' + '─'.repeat( 44 ) + '  Build' ) );

console.log(
	chalk.hex( '#21759b' ).bold( '→ ' ) +
		'Workspace build, then dev server.' +
		chalk.gray( ' Cold caches take a minute.\n' )
);

if ( process.env.CALYPSO_START_QUIET === 'true' ) {
	process.exit( 0 );
}

const DEV_TIPS = [
	'Tip: Wall time per `yarn build` step — `yarn time-build`',
	'Tip: Where boot / webpack spend time — `CALYPSO_TIME_START=true yarn start-build`',
	'Tip: Refresh `build/server.js` after server-only edits — `yarn build-server`',
	'Tip: Full client compile stats — `CALYPSO_WEBPACK_LOG=verbose yarn start-build`',
	"Tip: Only build sections you're working on — `ENTRY_LIMIT=entry-main SECTION_LIMIT=signup yarn start`",
];

console.log( chalk.gray( `  ${ DEV_TIPS[ Math.floor( Math.random() * DEV_TIPS.length ) ] }\n` ) );
