import mockery from 'mockery';

export default function wrap( beforeActions, afterActions ) {
	mockery.enable( {
		warnOnReplace: false,
		warnOnUnregistered: false
	} );
	if ( beforeActions ) {
		beforeActions();
	}

	after( function() {
		console.log( 'turning off mockery' );
		if ( afterActions ) {
			afterActions();
		}
		mockery.deregisterAll();
		mockery.disable();
	} );
}
