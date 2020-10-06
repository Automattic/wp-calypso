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
import config from 'calypso/config';
import { domainManagementEdit } from 'calypso/my-sites/domains/paths';
import { emailManagement } from 'calypso/my-sites/email/paths';
import { getThemeDetailsUrl } from 'calypso/state/themes/selectors';
import {
	isDomainProduct,
	isGoogleApps,
	isPlan,
	isSiteRedirect,
	isTheme,
} from 'calypso/lib/products-values';

const ProductLink = ( { productUrl, purchase, selectedSite } ) => {
	let props = {},
		url,
		text;

	if ( ! selectedSite ) {
		return <span />;
	}

	if ( isPlan( purchase ) ) {
		url = '/plans/my-plan/' + selectedSite.slug;
		text = i18n.translate( 'View Plan Features' );
	}

	if ( isDomainProduct( purchase ) || isSiteRedirect( purchase ) ) {
		url = domainManagementEdit( selectedSite.slug, purchase.meta );
		text = i18n.translate( 'Domain Settings' );
	}

	if ( isGoogleApps( purchase ) ) {
		url = emailManagement( selectedSite.slug, purchase.meta );
		text = i18n.translate( 'Email Settings' );
	}

	if ( isTheme( purchase ) ) {
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
	purchase: PropTypes.object.isRequired,
	selectedSite: PropTypes.oneOfType( [ PropTypes.bool, PropTypes.object ] ),
};

export default connect( ( state, { purchase } ) => {
	if ( isTheme( purchase ) ) {
		return {
			// No <QueryTheme /> component needed, since getThemeDetailsUrl() only needs the themeId which we pass here.
			productUrl: getThemeDetailsUrl( state, purchase.meta, purchase.siteId ),
		};
	}
	return {};
} )( ProductLink );
