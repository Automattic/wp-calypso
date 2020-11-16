/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';
import * as controller from './controller';

/**
 * Style dependencies
 */
import './style.scss';

export default function () {
	page( `/:locale/licenses`, controller.jetpackLicensingContext, makeLayout, clientRender );
	page( `/licenses`, controller.jetpackLicensingContext, makeLayout, clientRender );
}
