/**
 * External dependencies
 *
 * @format
 */

import config from 'config';

/**
 * Internal dependencies
 */
import { helloDemo } from './controller';
import { makeLayout, render as clientRender } from 'controller';

export default router => {
	if ( config.isEnabled( 'hello-world' ) ) {
		router( '/hello-world', helloDemo, makeLayout, clientRender );
	}
};
