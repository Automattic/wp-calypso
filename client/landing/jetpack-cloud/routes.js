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

const router = () => {
	page( '/app', navigation, jetpackCloud, makeLayout, clientRender );
};

export default router;
