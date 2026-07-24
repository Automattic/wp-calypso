import {
	isDomainProduct,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isSiteRedirect,
	isThemePurchase,
	isTitanMail,
} from '@automattic/calypso-products';
import { type SiteDetails } from '@automattic/data-stores';
import i18n from 'i18n-calypso';
import { connect } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { getThemeDetailsUrl } from 'calypso/state/themes/selectors';
import type { Purchase } from 'calypso/lib/purchases/types';
import type { IAppState } from 'calypso/state/types';

interface ProductLinkProps {
	purchase: Purchase;
	selectedSite?: SiteDetails | null | false;
	productUrl?: string | null;
}

const ProductLink = ( { productUrl, purchase, selectedSite }: ProductLinkProps ) => {
	let url;
	let text;

	if ( ! selectedSite ) {
		return <span />;
	}

	if ( isPlan( purchase ) ) {
		url = '/plans/' + selectedSite.slug;
		if ( isJetpackCloud() ) {
			url = 'https://wordpress.com' + url;
		}
		text = i18n.translate( 'Plan Features' );
	}

	if ( isDomainProduct( purchase ) || isSiteRedirect( purchase ) ) {
		url = domainManagementEdit( selectedSite.slug, purchase.meta as string );
		text = i18n.translate( 'Domain Settings' );
	}

	if ( isGSuiteOrGoogleWorkspace( purchase ) || isTitanMail( purchase ) ) {
		url = getEmailManagementPath( selectedSite.slug, purchase.meta );
		text = i18n.translate( 'Email Settings' );
	}

	if ( isThemePurchase( purchase ) ) {
		url = productUrl;
		text = i18n.translate( 'Theme Details' );
	}

	if ( url && text ) {
		return (
			<a className="product-link" href={ url }>
				{ text }
			</a>
		);
	}

	return <span />;
};

export default connect( ( state: IAppState, { purchase }: { purchase: Purchase } ) => {
	if ( isThemePurchase( purchase ) ) {
		return {
			// No <QueryTheme /> component needed, since getThemeDetailsUrl() only needs the themeId which we pass here.
			productUrl: getThemeDetailsUrl( state, purchase.meta as string, purchase.siteId ),
		};
	}
	return {};
} )( ProductLink );
