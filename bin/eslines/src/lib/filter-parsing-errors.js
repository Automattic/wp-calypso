/* eslint strict: "off" */

'use strict';

module.exports = function( report ) {
	const hasMessageFatalKey = ( message ) => {
		return message.fatal;
	};

	const hasFileAnyParsingErrors = ( file ) => {
		return file.messages.filter( hasMessageFatalKey ).length > 0;
	};

	return report.filter( hasFileAnyParsingErrors );
};
