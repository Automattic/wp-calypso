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
	page( `/partner-portal/partner`, controller.partnerContext, makeLayout, clientRender );

	page(
		`/partner-portal/terms-of-service`,
		controller.requireAccessContext,
		controller.termsOfServiceContext,
		makeLayout,
		clientRender
	);

	page(
		`/partner-portal/partner-key`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.partnerKeyContext,
		makeLayout,
		clientRender
	);

	page(
		`/partner-portal/:filter(unassigned|assigned|revoked)?`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.partnerPortalContext,
		makeLayout,
		clientRender
	);

	page(
		`/partner-portal/issue-license`,
		controller.requireAccessContext,
		controller.requireTermsOfServiceConsentContext,
		controller.requireSelectedPartnerKeyContext,
		controller.issueLicenseContext,
		makeLayout,
		clientRender
	);

	page( `/partner-portal/*`, '/partner-portal' );
}
