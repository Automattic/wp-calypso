/**
 * Internal dependencies
 */
import { domainConnectAuthorize } from './controller';
import { makeLayout } from 'controller';

export default ( router ) => {
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		domainConnectAuthorize,
		makeLayout
	);
};
