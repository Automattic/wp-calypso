/**
 * Must stay near the top of `server/index.js` imports.
 * `start-build` uses `node --no-warnings` so Node does not print the stock warning template
 * (noisy and it interleaves badly with spinners on stderr). Every warning is still delivered via
 * this `warning` event; we print one clear, branded block per warning. Stacks: CALYPSO_TRACE_WARNINGS=true.
 */
import chalk from 'chalk';

if ( process.env.NODE_ENV === 'development' && process.env.CI !== 'true' ) {
	process.on( 'warning', ( warning ) => {
		const meta = [ warning.name, warning.code ].filter( Boolean ).join( ' · ' );
		let block =
			'\n' +
			chalk.hex( '#21759b' ).bold( '▸ runtime notice' ) +
			chalk.gray( ` · ${ meta }\n` ) +
			'  ' +
			chalk.gray( String( warning.message ).replace( /\n/g, '\n  ' ) ) +
			'\n';
		if ( process.env.CALYPSO_TRACE_WARNINGS === 'true' && warning.stack ) {
			block += chalk.dim( warning.stack.replace( /\n/g, '\n  ' ) ) + '\n';
		}
		// Clear any active spinner on the current line before printing.
		if ( process.stderr.isTTY ) {
			process.stderr.write( '\r\x1b[2K' );
		}
		process.stderr.write( block );
	} );
}
