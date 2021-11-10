import wpcom from 'calypso/lib/wp';

export function requestGdprConsentManagementLink( domainName ) {
	return wpcom.req.get( `/domains/${ domainName }/request-gdpr-consent-management-link` );
}
