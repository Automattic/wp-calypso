/**
 * External dependencies
 */
import debugFactory from 'debug';
import wpcom from 'lib/wp';

const debug = debugFactory( 'calypso:preview-save-functions' );

export function setSiteSettings( site, newSettings ) {
	return function() {
		debug( 'saving site settings:', newSettings );
		wpcom.undocumented().settings( site, 'post', newSettings, function( error, data ) {
			// TODO: handle errors, notify success
			debug( 'saving site settings complete', error, data );
		} );
	};
}
