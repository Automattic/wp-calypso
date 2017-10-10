/**
 * @format
 */

/**
 * Internal dependencies
 */
import config from 'config';

export default function() {
	if ( config.isEnabled( 'css-hot-reload' ) ) {
		asyncRequire( 'lib/css-hot-reload', cssHotReload => cssHotReload() );
	}
}
