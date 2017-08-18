module.exports = function( report, rulesToEnforce ) {
	// Do nothing when no rules are defined
	if ( ! Array.isArray( rulesToEnforce ) || ( rulesToEnforce.length === 0 ) ) {
		return report;
	}

	// deep clone the report, so we can create a new one
	// to tweak and edit in place - as this function remains pure.
	const newReport = JSON.parse( JSON.stringify( report ) );

	const shouldEnforceRule = ( ruleId, toEnforce ) => toEnforce.indexOf( ruleId ) > -1;

	newReport.forEach( file => {
		file.messages.forEach( message => {
			if ( shouldEnforceRule( message.ruleId, rulesToEnforce ) ) {
				message.severity = 2;
				file.warningCount --;
				file.errorCount ++;
			}
		} );
	} );

	return newReport;
};
