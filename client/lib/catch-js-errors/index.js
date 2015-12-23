/**
 * Internal dependencies
 */
import wpcomLib from 'lib/wp';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();

export default ( message, scriptUrl, lineNumber, columnNumber, error ) => {
	error = error || new Error( message );
	const stringifiedError = JSON.stringify( {
		message: error.message,
		type: error.constructor && error.constructor.name,
		userAgent: navigator.userAgent,
		stack: error.stack
	} );

	// POST to the API
	wpcom.jsError( stringifiedError );
};
