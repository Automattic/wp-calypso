/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { jetpackCloud } from './controller';
import { navigation } from 'my-sites/controller';
import { makeLayout, render as clientRender } from 'controller';
import { normalize } from 'lib/route';

const router = () => {
	page( '*', normalize );

	page( '/', navigation, jetpackCloud, makeLayout, clientRender );
};

export default router;
