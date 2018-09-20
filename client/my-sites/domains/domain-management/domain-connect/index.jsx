/** @format */

/**
 * Internal dependencies
 */

import { domainConnectAuthorize, notFoundError } from './controller';
import { makeLayout, redirectLoggedOut, render as clientRender } from 'controller';

export default router => {
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		redirectLoggedOut,
		domainConnectAuthorize,
		makeLayout,
		clientRender
	);
	router( '/domain-connect/*', notFoundError, makeLayout, clientRender );
};
