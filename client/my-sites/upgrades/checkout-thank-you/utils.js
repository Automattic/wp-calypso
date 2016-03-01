/**
 * Internal dependencies
 */
import paths from 'my-sites/upgrades/paths';

function getDomainManagementUrl( selectedSite, domain ) {
	let url;

	if ( domain ) {
		url = paths.domainManagementEdit( selectedSite.domain, domain );
	} else {
		url = paths.domainManagementList( selectedSite.domain );
	}

	return url;
}

export default {
	getDomainManagementUrl
};
