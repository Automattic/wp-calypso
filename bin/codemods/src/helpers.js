function bindEvents( jscodeshiftProcess ) {
	jscodeshiftProcess.stdout.on( 'data', ( data ) => {
		process.stdout.write( data );
	} );

	jscodeshiftProcess.stderr.on( 'data', ( data ) => {
		process.stderr.write( data );
	} );
}

module.exports = {
	bindEvents,
};
