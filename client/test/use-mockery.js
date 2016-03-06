import mockery from 'mockery';
import debug from 'debug';

const log = debug( 'calypso:test:use-mockery' );

export default function useMockery( beforeActions, afterActions ) {
	before( function() {
		log( 'turning on mockery' );
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false,
			useCleanCache: true // have to use this with a large set of tests
		} );
		if ( beforeActions ) {
			beforeActions();
		}
	} );

	after( function() {
		log( 'turning off mockery' );
		if ( afterActions ) {
			afterActions();
		}
		mockery.deregisterAll();
		mockery.disable();
	} );
}
