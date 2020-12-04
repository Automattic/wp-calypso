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
	// TODO fix locale so it works.
	page(
		`/:locale/licensing-portal/partner-key`,
		controller.withLocale,
		controller.partnerKeyContext,
		makeLayout,
		clientRender
	);
	page(
		`/licensing-portal/partner-key`,
		controller.withLocale,
		controller.partnerKeyContext,
		makeLayout,
		clientRender
	);

	page(
		`/:locale/licensing-portal`,
		controller.withLocale,
		controller.requirePartnerKeyContext,
		controller.licensingPortalContext,
		makeLayout,
		clientRender
	);
	page(
		`/licensing-portal`,
		controller.withLocale,
		controller.requirePartnerKeyContext,
		controller.licensingPortalContext,
		makeLayout,
		clientRender
	);
}
