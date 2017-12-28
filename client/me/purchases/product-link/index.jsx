/** @format */

/**
 * External dependencies
 */

import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import i18n from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import config from 'config';
import { domainManagementEdit } from 'client/my-sites/domains/paths';
import { getThemeDetailsUrl } from 'client/state/themes/selectors';
import { googleAppsSettingsUrl } from 'client/lib/google-apps';
import {
	isDomainProduct,
	isGoogleApps,
	isPlan,
	isSiteRedirect,
	isTheme,
} from 'client/lib/products-values';

const ProductLink = ( { selectedPurchase, selectedSite, productUrl } ) => {
	let props = {},
		url,
		text;

	if ( ! selectedSite ) {
		return <span />;
	}

	if ( isPlan( selectedPurchase ) ) {
		url = '/plans/compare/' + selectedSite.slug;
		text = i18n.translate( 'View Plan Features' );
	}

	if ( isDomainProduct( selectedPurchase ) || isSiteRedirect( selectedPurchase ) ) {
		url = domainManagementEdit( selectedSite.slug, selectedPurchase.meta );
		text = i18n.translate( 'Domain Settings' );
	}

	if ( isGoogleApps( selectedPurchase ) ) {
		url = googleAppsSettingsUrl( selectedPurchase.meta );
		text = i18n.translate( 'G Suite Settings' );
	}

	if ( isTheme( selectedPurchase ) ) {
		url = productUrl;
		text = i18n.translate( 'Theme Details' );

		if ( ! config.isEnabled( 'manage/themes/details' ) ) {
			props = { target: '_blank' };
		}
	}

	if ( url && text ) {
		return (
			<a className="product-link" href={ url } { ...props }>
				{ text }
			</a>
		);
	}

	return <span />;
};

ProductLink.propTypes = {
	selectedPurchase: PropTypes.object.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

export default connect( ( state, { selectedPurchase } ) => {
	if ( isTheme( selectedPurchase ) ) {
		return {
			// No <QueryTheme /> component needed, since getThemeDetailsUrl() only needs the themeId which we pass here.
			productUrl: getThemeDetailsUrl( state, selectedPurchase.meta, selectedPurchase.siteId ),
		};
	}
	return {};
} )( ProductLink );
