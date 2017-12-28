/** @format */

/**
 * Internal dependencies
 */

import page from 'page';
import userFactory from 'client/lib/user';
import { canAddGoogleApps } from 'client/lib/domains';

const user = userFactory();

function goToDomainCheckout( domainSuggestion, selectedSiteSlug ) {
	if (
		user.get().is_valid_google_apps_country &&
		canAddGoogleApps( domainSuggestion.domain_name )
	) {
		page( '/domains/add/' + domainSuggestion.domain_name + '/google-apps/' + selectedSiteSlug );
	} else {
		page( '/checkout/' + selectedSiteSlug );
	}
}

export { goToDomainCheckout };
