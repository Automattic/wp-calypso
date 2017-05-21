/**
 * Internal dependencies
 */
import { domainConnectAuthorize } from './controller';
import { makeLayout } from 'controller';

export default ( router ) => {
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:provider_id/services/:template_id/apply',
		domainConnectAuthorize,
		makeLayout
	);
};
