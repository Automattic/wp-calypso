/** @format */
/**
 * External dependencies
 */
import superagent from 'superagent';

/**
 * Internal dependencies
 */
const LANG_REVISION_FILE_URL = 'https://widgets.wp.com/languages/calypso/lang-revisions.json';

export const getLangRevisions = () => {
	return new Promise( ( resolve, reject ) => {
		superagent.get( LANG_REVISION_FILE_URL ).end( function( err, res ) {
			if ( err ) {
				return reject( err );
			}

			resolve( res.body );
		} );
	} );
};
