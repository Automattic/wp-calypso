/**
 * Internal dependencies
 */
import page from 'page';
import sitesFactory from 'lib/sites-list';
import userFactory from 'lib/user';
import { canAddGoogleApps } from 'lib/domains';
import { addDomainToCart } from './cart';

const sites = sitesFactory(), user = userFactory();

function registerDomain(domainSuggestion) {
    addDomainToCart(domainSuggestion);
    goToDomainCheckout(domainSuggestion);
}

function goToDomainCheckout(domainSuggestion) {
    const siteSlug = sites.getSelectedSite().slug;

    if (user.get().is_valid_google_apps_country && canAddGoogleApps(domainSuggestion.domain_name)) {
        page('/domains/add/' + domainSuggestion.domain_name + '/google-apps/' + siteSlug);
    } else {
        page('/checkout/' + siteSlug);
    }
}

export { goToDomainCheckout, registerDomain };
