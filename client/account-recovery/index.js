/**
 * External dependencies
 */
import config from 'config';

/**
 * Internal dependencies
 */
import { accountRecoveryRoot } from './controller';
import { makeLayout, redirectLoggedIn } from 'controller';

export default function( router ) {
	if ( config.isEnabled( 'account-recovery' ) ) {
		router( '/account-recovery', redirectLoggedIn, accountRecoveryRoot, makeLayout );
	}
}
