/**
 * Internal dependencies
 */
import { domainConnectAuthorize } from './controller';
import { makeLayout } from 'controller';

export default ( router ) => {
console.log( 'blergin' );
	router(
		'/domain-connect/authorize/v2/domainTemplates/providers/:providerId/services/:serviceId/apply',
		domainConnectAuthorize,
		makeLayout
	);
};
