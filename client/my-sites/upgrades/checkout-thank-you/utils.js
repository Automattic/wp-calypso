/**
 * Internal dependencies
 */
import config from 'config';
import paths from 'my-sites/upgrades/paths';

function getDomainManagementUrl( selectedSite, domain ) {
	let url;

	if ( config.isEnabled( 'upgrades/domain-management/list' ) ) {
		if ( domain ) {
			url = paths.domainManagementEdit( selectedSite.domain, domain );
		} else {
			url = paths.domainManagementList( selectedSite.domain );
		}
	} else {
		url = '/my-domains/' + selectedSite.ID;
	}

	return url;
}

export default {
	getDomainManagementUrl
};
