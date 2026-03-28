#!/usr/bin/env node

/**
 * Runs before `yarn build` in `yarn start` so the console isn’t silent during the workspace build.
 */

const chalk = require( 'chalk' );

const WP_BLUE = '#21759b';

if ( process.env.CI === 'true' ) {
	process.exit( 0 );
}

console.log( chalk.hex( WP_BLUE )( '\n' + '─'.repeat( 44 ) + '  Build' ) );

console.log(
	chalk.hex( WP_BLUE ).bold( '→ ' ) +
		'Workspace build, then dev server.' +
		chalk.gray( ' Cold caches take a minute.\n' )
);

if ( process.env.CALYPSO_START_QUIET === 'true' ) {
	process.exit( 0 );
}

const DEV_TIPS = [
	'Tip: `yarn time-build` — wall time per `yarn build` step.',
	'Tip: `CALYPSO_TIME_START=true yarn start-build` — where boot / webpack spend time.',
	'Tip: `yarn build-server` — refresh `build/server.js` after server-only edits.',
	'Tip: `CALYPSO_WEBPACK_LOG=verbose yarn start-build` — full client compile stats.',
	'Tip: `ENTRY_LIMIT` / `SECTION_LIMIT` — trim the client bundle while you iterate.',
];

console.log( chalk.gray( `  ${ DEV_TIPS[ Math.floor( Math.random() * DEV_TIPS.length ) ] }\n` ) );
