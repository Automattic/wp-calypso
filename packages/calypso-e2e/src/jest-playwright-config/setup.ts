import { jest } from '@jest/globals';
import config from 'config';

if ( process.env.PWDEBUG === '1' ) {
	// If the user intends to debug the suite, extend the default timeout.
	jest.setTimeout( ( config.get( 'jestTimeoutMS' ) as number ) * 1000 );
} else {
	jest.setTimeout( config.get( 'jestTimeoutMS' ) );
}
