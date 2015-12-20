/**
 * Internal dependencies
 */
import wpcomLib from 'lib/wp';

/**
 * Module variables
 */
const wpcom = wpcomLib.undocumented();

export default ( error ) => {
	// POST to the API
	wpcom.jsError( error + ' ' + navigator.userAgent );
};
