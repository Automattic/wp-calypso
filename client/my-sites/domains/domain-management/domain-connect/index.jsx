/**
 * Internal dependencies
 */

import { domainConnectAuthorize, notFoundError } from './controller';
import { makeLayout, render as clientRender } from 'calypso/controller';

export default ( router ) => {
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		domainConnectAuthorize,
		makeLayout,
		clientRender
	);
	router( '/domain-connect/*', notFoundError, makeLayout, clientRender );
};
