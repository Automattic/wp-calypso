import chalk from 'chalk';

const FRAMES = [ '⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏' ];

let timer = null;
let frame = 0;

function render( message ) {
	const glyph = FRAMES[ frame % FRAMES.length ];
	frame++;
	const stream = process.stderr;
	stream.write( '\r\x1b[2K' + chalk.hex( '#21759b' )( glyph ) + ' ' + chalk.gray( message ) );
}

export function startDevBootSpinner( message ) {
	if ( process.env.NODE_ENV !== 'development' || process.env.CI === 'true' ) {
		return;
	}

	if ( ! process.stderr.isTTY ) {
		console.error( chalk.gray( message || 'Booting dev server…' ) );
		return;
	}

	stopDevBootSpinner();
	frame = 0;
	message = message || 'Booting dev server…';
	render( message );
	timer = setInterval( function () {
		render( message );
	}, 90 );
}

export function stopDevBootSpinner() {
	const wasRunning = timer != null;
	if ( timer ) {
		clearInterval( timer );
		timer = null;
	}
	if ( wasRunning && process.stderr.isTTY ) {
		process.stderr.write( '\r\x1b[2K\n' );
	}
}

// Auto-start when imported as a side-effect (boot/index.js).
// ESM evaluates once, so subsequent imports (bundler) just get the exports.
startDevBootSpinner();
