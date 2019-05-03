/**
 * External dependencies
 */
import { connect } from 'react-redux';
import page from 'page';
import React, { Fragment, FunctionComponent } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { addQueryArgs } from 'lib/url';
import Button from 'components/button';
import { getSelectedSite } from 'state/ui/selectors';
import GoogleVoucherDetails from 'my-sites/checkout/checkout-thank-you/google-voucher';
import { isPremium, isBusiness, isEcommerce, isEnterprise } from 'lib/products-values';
import isSiteAtomic from 'state/selectors/is-site-automated-transfer';
import MarketingToolsFeature from './feature';
import { PLAN_PREMIUM } from 'lib/plans/constants';
import QuerySiteVouchers from 'components/data/query-site-vouchers';
import { recordTracksEvent as recordTracksEventAction } from 'state/analytics/actions';

/**
 * Style dependencies
 */
import './style.scss';

interface ConnectedProps {
	isAtomic: boolean;
	isJetpack: boolean;
	isPremiumOrHigher: boolean;
	recordTracksEvent: () => void;
	siteId: number | null;
	siteSlug: string | null;
}

export const MarketingToolsGoogleAdwordsFeature: FunctionComponent< ConnectedProps > = ( {
	isAtomic,
	isJetpack,
	isPremiumOrHigher,
	recordTracksEvent,
	siteId,
	siteSlug,
} ) => {
	const translate = useTranslate();
	if ( ( isJetpack && ! isAtomic ) || ! siteId || ! siteSlug ) {
		return null;
	}

	const handleUpgradeClick = () => {
		recordTracksEvent( 'calypso_marketing_tools_adwords_plan_upgrade_button_click' );
		page( addQueryArgs( { plan: PLAN_PREMIUM }, `/plans/${ siteSlug }` ) );
	};

	const renderButton = () => {
		if ( isPremiumOrHigher ) {
			return <GoogleVoucherDetails />;
		}
		return <Button onClick={ handleUpgradeClick }>{ translate( 'Upgrade To Premium' ) }</Button>;
	};

	return (
		<Fragment>
			<QuerySiteVouchers siteId={ siteId } />
			<MarketingToolsFeature
				title={ translate( 'Advertise with your $100 Google Adwords credit' ) }
				description={ translate(
					"Advertise your site where most people are searching: Google. You've got a $100 credit with Google Adwords to drive traffic to your most important pages."
				) }
				imagePath="/calypso/images/illustrations/marketing.svg"
			>
				{ renderButton() }
			</MarketingToolsFeature>
		</Fragment>
	);
};

export default connect(
	state => {
		const site = getSelectedSite( state );
		const isAtomic = isSiteAtomic( state, site.ID ) || false;
		const isPremiumOrHigher =
			isPremium( site.plan ) ||
			isBusiness( site.plan ) ||
			isEcommerce( site.plan ) ||
			isEnterprise( site.plan );
		return {
			isAtomic,
			isJetpack: site && site.jetpack,
			isPremiumOrHigher,
			siteId: site && site.ID,
			siteSlug: site && site.slug,
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingToolsGoogleAdwordsFeature );
