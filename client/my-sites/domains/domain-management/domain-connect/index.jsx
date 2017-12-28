/** @format */

/**
 * Internal dependencies
 */

import { domainConnectAuthorize, notFoundError } from './controller';
import { makeLayout } from 'client/controller';

export default router => {
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		domainConnectAuthorize,
		makeLayout
	);
	router( '/*', notFoundError, makeLayout );
};
