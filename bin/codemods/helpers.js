const ERROR_STATUS = 'ERR';
const PROCESSED_STATUS = 'OKK';
const IGNORABLE_STATUSES = [
	'SKIP',
	'NOC',
	'files to free worker',
];

function isIgnorable( buffer ) {
	return IGNORABLE_STATUSES.some( s => buffer.includes( s ) );
}

function bindEvents( jscodeshiftProcess ) {
	const processedFiles = [];
	jscodeshiftProcess.stdout.on( 'data', ( data ) => {
		// Extract processed file list Handle verbose status output
		if ( isIgnorable( data ) ) {
			return;
		} else if ( data.includes( ERROR_STATUS ) ) {
			process.stderr.write( data );
		} else if ( data.includes( PROCESSED_STATUS ) ) {
			const files = data.toString().split( '\n' ).filter( s => (
				s.trim().length > 0
			) ).map( s => (
				s.replace( ' OKK ', '' )
			) )
			processedFiles.push( ...files );
			return;
		}

		process.stdout.write( data );
	} );

	jscodeshiftProcess.stderr.on( 'data', ( data ) => {
		process.stderr.write( data );
	} );

	jscodeshiftProcess.on( 'close', () => {
		// Send processed files if this child process was instantiated with an IPC pipe
		if ( process.send ) {
			process.send( { processedFiles } );
		}
	} );
}

module.exports = {
	bindEvents,
};
