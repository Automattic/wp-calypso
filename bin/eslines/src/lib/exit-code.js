/* eslint strict: "off" */

'use strict';

module.exports = function( report ) {
	let code = 0;

	report.forEach( file => {
		file.messages.forEach( message => {
			if ( message.severity === 2 ) {
				code = 1;
			}
		} );
	} );

	return code;
};
