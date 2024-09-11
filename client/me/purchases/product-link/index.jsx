import {
	isDomainProduct,
	isGSuiteOrGoogleWorkspace,
	isPlan,
	isSiteRedirect,
	isThemePurchase,
	isTitanMail,
} from '@automattic/calypso-products';
import i18n from 'i18n-calypso';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { getEmailManagementPath } from 'calypso/my-sites/email/paths';
import { getThemeDetailsUrl } from 'calypso/state/themes/selectors';

const ProductLink = ( { productUrl, purchase, selectedSite } ) => {
	let url;
	let text;

	if ( ! selectedSite ) {
		return <span />;
	}

	if ( isPlan( purchase ) ) {
		url = '/plans/my-plan/' + selectedSite.slug;
		if ( isJetpackCloud() ) {
			url = 'https://wordpress.com' + url;
		}
		text = i18n.translate( 'Plan Features' );
	}

	if ( isDomainProduct( purchase ) || isSiteRedirect( purchase ) ) {
		url = domainManagementEdit( selectedSite.slug, purchase.meta );
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

ProductLink.propTypes = {
	purchase: PropTypes.object.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

export default connect( ( state, { purchase } ) => {
	if ( isThemePurchase( purchase ) ) {
		return {
			// No <QueryTheme /> component needed, since getThemeDetailsUrl() only needs the themeId which we pass here.
			productUrl: getThemeDetailsUrl( state, purchase.meta, purchase.siteId ),
		};
	}
	return {};
} )( ProductLink );
