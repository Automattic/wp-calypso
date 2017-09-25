/**
 * External dependencies
 */
import page from 'page';

/**
 * Internal dependencies
 */
import { canAddGoogleApps } from 'lib/domains';
import userFactory from 'lib/user';

const user = userFactory();

function goToDomainCheckout( domainSuggestion, selectedSiteSlug ) {
	if ( user.get().is_valid_google_apps_country && canAddGoogleApps( domainSuggestion.domain_name ) ) {
		page( '/domains/add/' + domainSuggestion.domain_name + '/google-apps/' + selectedSiteSlug );
	} else {
		page( '/checkout/' + selectedSiteSlug );
	}
}

export {
	goToDomainCheckout
};
