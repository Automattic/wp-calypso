/**
 * Internal dependencies
 */
import Logger from 'calypso/lib/catch-js-errors';

// TODO Should we check for some config like it's done in Calypso?
/*if ( ! config.isEnabled( 'catch-js-errors' ) ) {
		return;
}*/

const errorLogger = new Logger();

// Save data to JS error logger
errorLogger.saveDiagnosticData( {
	user_id: 'where-to-get-the-id-from',
	// anything else to include?
} );

// Save data to JS error logger
// Remember it should work for both simple and AT sites!
errorLogger.saveDiagnosticData( {
	user_id: 'where-to-get-the-user-id-from',
	//user_id: getCurrentUserId( reduxStore.getState() ),
	//calypso_env: config( 'env_id' ),
} );

errorLogger.saveDiagnosticReducer( function () {
	return {
		blog_id: 'where-to-get-the-blog-id-from',
	};
} );
