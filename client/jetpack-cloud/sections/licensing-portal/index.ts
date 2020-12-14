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
	page( `/licensing-portal/partner-key`, controller.partnerKeyContext, makeLayout, clientRender );
	page(
		`/licensing-portal`,
		controller.requirePartnerKeyContext,
		controller.licensingPortalContext,
		makeLayout,
		clientRender
	);
}
