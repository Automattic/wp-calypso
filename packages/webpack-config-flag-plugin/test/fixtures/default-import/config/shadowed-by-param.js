import config from 'config';

function fn( config ) {
	// Should NOT be replaced with true
	if ( config.isEnabled( 'foo' ) ) {
	}
}
