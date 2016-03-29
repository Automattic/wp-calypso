/**
 * External Dependencies
 */
import React from 'react';

/**
 * Internal Dependencies
 */
import { domainManagementEdit } from 'my-sites/upgrades/paths';
import { getDetailsUrl as getThemeDetailsUrl } from 'my-sites/themes/helpers';
import { googleAppsSettingsUrl } from 'lib/google-apps';
import i18n from 'lib/mixins/i18n';
import { isDomainProduct, isGoogleApps, isPlan, isSiteRedirect, isTheme } from 'lib/products-values';

const ProductLink = React.createClass( {
	propTypes: {
		selectedPurchase: React.PropTypes.object.isRequired,
		selectedSite: React.PropTypes.oneOfType( [
			React.PropTypes.bool,
			React.PropTypes.object
		] ).isRequired
	},

	render() {
		const { selectedPurchase, selectedSite } = this.props;

		let url, text;

		if ( ! selectedSite ) {
			return null;
		}

		if ( isPlan( selectedPurchase ) ) {
			url = '/plans/compare';
			text = i18n.translate( 'View Plan Features' );
		}

		if ( isDomainProduct( selectedPurchase ) || isSiteRedirect( selectedPurchase ) ) {
			url = domainManagementEdit( selectedSite.slug, selectedPurchase.meta );
			text = i18n.translate( 'Domain Settings' );
		}

		if ( isGoogleApps( selectedPurchase ) ) {
			url = googleAppsSettingsUrl( selectedPurchase.meta );
			text = i18n.translate( 'Google Apps Settings' );
		}

		if ( isTheme( selectedPurchase ) ) {
			url = getThemeDetailsUrl( { id: selectedPurchase.meta }, { slug: selectedPurchase.domain } );
			text = i18n.translate( 'Theme Details' );
		}

		if ( url && text ) {
			return (
				<a className="product-link" href={ url }>
					{ text }
				</a>
			);
		}

		return null;
	}
} );

export default ProductLink;
