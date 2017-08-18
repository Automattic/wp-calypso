module.exports = function( results ) {
	const filtered = [];

	const isErrorMessage = ( message ) => message.severity === 2;

	results.forEach( result => {
		const filteredMessages = result.messages.filter( isErrorMessage );

		if ( filteredMessages.length > 0 ) {
			filtered.push(
				Object.assign( result, {
					messages: filteredMessages,
					errorCount: filteredMessages.length,
					warningCount: 0
				} )
			);
		}
	} );

	return filtered;
};
