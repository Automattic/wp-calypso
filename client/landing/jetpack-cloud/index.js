/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackCloud, jetpackBackups, jetpackScan } from './controller';

import { navigation } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';

export default function() {
	page( '/', navigation, jetpackCloud, makeLayout, clientRender );

	page( '/backups', navigation, jetpackBackups, makeLayout, clientRender );

	page( '/scan', navigation, jetpackScan, makeLayout, clientRender );
}
