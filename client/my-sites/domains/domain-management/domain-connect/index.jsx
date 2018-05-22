/** @format */

/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { makeLayout, render as clientRender } from 'controller';
import { domainConnectAuthorize } from './controller';

export default () => {
	page(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		domainConnectAuthorize,
		makeLayout,
		clientRender
	);
};
