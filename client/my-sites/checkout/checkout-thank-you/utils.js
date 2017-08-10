/** @format */
/**
 * Internal dependencies
 */
import paths from 'my-sites/domains/paths';

function getDomainManagementUrl( { slug }, domain ) {
	return domain ? paths.domainManagementEdit( slug, domain ) : paths.domainManagementList( slug );
}

export default {
	getDomainManagementUrl,
};
