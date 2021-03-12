/**
 * External dependencies
 */

import page from 'page';

/**
 * Internal dependencies
 */
import controller from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default () => {
	page( '/me/difm-intake', controller.intake, makeLayout, clientRender );
};
