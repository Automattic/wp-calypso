/**
 * External dependencies
 */
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import { getSelectedSite } from 'state/ui/selectors';
import GoogleVoucherDetails from 'my-sites/checkout/checkout-thank-you/google-voucher';
import { isPremium, isBusiness, isEcommerce, isEnterprise } from 'lib/products-values';
import MarketingToolsFeature from './feature';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

/**
 * Style dependencies
 */
import './style.scss';

interface ConnectProps {
	isJetpack: boolean;
	isPremiumOrHigher: boolean;
	site: { id: string };
}

export const GoogleAdwordsCard: FunctionComponent< ConnectProps > = ( {
	isJetpack,
	isPremiumOrHigher,
	site,
} ) => {
	const translate = useTranslate();
	if ( isJetpack ) {
		return null;
	}

	const renderButton = () => {
		const buttonText = isPremiumOrHigher
			? translate( 'Generate code' )
			: translate( 'Upgrade to Premium' );

		if ( isPremiumOrHigher ) {
			return <GoogleVoucherDetails selectedSite={ site } />;
		}
		return <Button>{ buttonText }</Button>;
	};

	return (
		<Fragment>
			<QuerySiteVouchers siteId={ site.id } />
			<MarketingToolsFeature
				title={ translate( 'Advertise with your $100 Google Adwords credit' ) }
				description={ translate(
					'Advertise your site where most people are searching: Google. You’ve got a $100 credit with Google Adwords to drive traffic to your most important pages.'
				) }
				imagePath="/calypso/images/illustrations/marketing.svg"
			>
				{ renderButton() }
			</MarketingToolsFeature>
		</Fragment>
	);
};

GoogleAdwordsCard.propTypes = {
	isJetpack: PropTypes.bool.isRequired,
	isPremiumOrHigher: PropTypes.bool.isRequired,
	site: PropTypes.shape( { id: PropTypes.string.isRequired } ).isRequired,
};

export default connect< ConnectProps >( state => {
	const site = getSelectedSite( state );
	const isPremiumOrHigher =
		isPremium( site.plan ) ||
		isBusiness( site.plan ) ||
		isEcommerce( site.plan ) ||
		isEnterprise( site.plan );
	return {
		isJetpack: site && site.jetpack,
		isPremiumOrHigher,
		site,
	};
} )( GoogleAdwordsCard );
