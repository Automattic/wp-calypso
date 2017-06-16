/**
 * Internal dependencies
 */
import { domainConnectAuthorize, notFoundError } from './controller';
import { makeLayout } from 'controller';

export default ( router ) => {
console.log( 'blargin' );
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		domainConnectAuthorize,
		makeLayout
	);
	router( notFoundError );
};
