/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import * as controller from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller/index.web';

/**
 * Style dependencies
 */
import './style.scss';

const redirectToPrimaryLanding = () => {
	page( '/partner-portal/licenses' );
};

export default function () {
	page( '/partner-portal/analytics', controller.analytics, makeLayout, clientRender );
	page( '/partner-portal/licenses', controller.licenses, makeLayout, clientRender );
	page( '/partner-portal/logs', controller.logs, makeLayout, clientRender );
	page( '/partner-portal/settings', controller.settings, makeLayout, clientRender );

	page( '/partner-portal', redirectToPrimaryLanding );
}
