/** @format */
/**
 * Internal dependencies
 */
import { canDomainAddGsuite } from 'lib/domains/gsuite';
import page from 'page';
import userFactory from 'lib/user';

const user = userFactory();

export function goToDomainCheckout( domainSuggestion, selectedSiteSlug ) {
	if (
		user.get().is_valid_google_apps_country &&
		canDomainAddGsuite( domainSuggestion.domain_name )
	) {
		page( '/domains/add/' + domainSuggestion.domain_name + '/google-apps/' + selectedSiteSlug );
	} else {
		page( '/checkout/' + selectedSiteSlug );
	}
}
