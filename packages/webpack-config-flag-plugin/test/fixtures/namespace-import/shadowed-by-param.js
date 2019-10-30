import * as config from 'config';

// Should NOT be replaced with true
function fn( config ) {
	if ( config.isEnabled( 'foo' ) ) {
	}
}
