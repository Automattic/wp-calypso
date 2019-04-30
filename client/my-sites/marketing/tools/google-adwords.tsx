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
import { isPremium, isBusiness, isEcommerce, isEnterprise } from 'lib/products-values';
import MarketingToolsFeature from './feature';
import QuerySiteVouchers from 'components/data/query-site-vouchers';

/**
 * Style dependencies
 */
import './style.scss';

interface Props {
	isJetpack: boolean;
	isPremiumOrHigher: boolean;
	selectedSiteId: string;
}

export const GoogleAdwordsCard: FunctionComponent< Props > = ( {
	isJetpack,
	isPremiumOrHigher,
	selectedSiteId,
} ) => {
	const translate = useTranslate();
	if ( isJetpack || ! isPremiumOrHigher ) {
		return null;
	}
	return (
		<Fragment>
			<QuerySiteVouchers siteId={ selectedSiteId } />
			<MarketingToolsFeature
				title={ translate( 'Advertise with your $100 Google Adwords credit' ) }
				description={ translate(
					'Advertise your site where most people are searching: Google. You’ve got a $100 credit with Google Adwords to drive traffic to your most important pages.'
				) }
				imagePath="/calypso/images/illustrations/marketing.svg"
			>
				<Button>{ translate( 'Start Sharing' ) }</Button>
			</MarketingToolsFeature>
		</Fragment>
	);
};

GoogleAdwordsCard.propTypes = {
	isJetpack: PropTypes.bool.isRequired,
	isPremiumOrHigher: PropTypes.bool.isRequired,
	selectedSiteId: PropTypes.string.isRequired,
};

export default connect( state => {
	const site = getSelectedSite( state );
	const isPremiumOrHigher =
		isPremium( site.plan ) ||
		isBusiness( site.plan ) ||
		isEcommerce( site.plan ) ||
		isEnterprise( site.plan );
	return {
		isJetpack: site && site.jetpack,
		isPremiumOrHigher,
		selectedSiteId: site.id,
	};
} )( GoogleAdwordsCard );
