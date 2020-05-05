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
import { Button } from '@automattic/components';
import { getCurrentUserCountryCode } from 'state/current-user/selectors';
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
	recordTracksEvent: typeof recordTracksEventAction;
	showCard: boolean;
	siteId: number | null;
	siteSlug: string | null;
}

export const MarketingToolsGoogleAdwordsFeature: FunctionComponent< ConnectedProps > = ( {
	isAtomic,
	isJetpack,
	isPremiumOrHigher,
	recordTracksEvent,
	showCard,
	siteId,
	siteSlug,
} ) => {
	const translate = useTranslate();
	if ( ! showCard || ( isJetpack && ! isAtomic ) || ! siteId || ! siteSlug ) {
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
		return (
			<Button className="tools__upgrade-button" compact onClick={ handleUpgradeClick }>
				{ translate( 'Upgrade to Premium' ) }
			</Button>
		);
	};

	return (
		<Fragment>
			<QuerySiteVouchers siteId={ siteId } />
			<MarketingToolsFeature
				title={ translate( 'Advertise with your %(cost)s Google Adwords credit', {
					args: {
						cost: '$100',
					},
				} ) }
				description={ translate(
					"Advertise your site where most people are searching: Google. You've got a %(cost)s credit with Google Adwords to drive traffic to your most important pages.",
					{
						args: {
							cost: '$100',
						},
					}
				) }
				imagePath="/calypso/images/marketing/google-ads-logo.png"
			>
				{ renderButton() }
			</MarketingToolsFeature>
		</Fragment>
	);
};

export default connect(
	( state ) => {
		const userInUsa = getCurrentUserCountryCode( state ) === 'US';
		const userInCa = getCurrentUserCountryCode( state ) === 'CA';
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
			showCard: userInUsa || userInCa,
			siteId: site && site.ID,
			siteSlug: site && site.slug,
		};
	},
	{
		recordTracksEvent: recordTracksEventAction,
	}
)( MarketingToolsGoogleAdwordsFeature );
