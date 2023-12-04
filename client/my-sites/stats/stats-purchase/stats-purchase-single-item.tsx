import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button as CalypsoButton } from '@automattic/components';
import { Button, Panel, PanelBody, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import PersonalPurchase from './stats-purchase-personal';
import {
	StatsCommercialPriceDisplay,
	StatsBenefitsCommercial,
	StatsSingleItemPagePurchaseFrame,
} from './stats-purchase-shared';
import TierUpgradeSlider from './stats-purchase-tier-upgrade-slider';
import {
	MIN_STEP_SPLITS,
	DEFAULT_STARTING_FRACTION,
	UI_EMOJI_HEART_TIER_THRESHOLD,
	UI_IMAGE_CELEBRATION_TIER_THRESHOLD,
} from './stats-purchase-wizard';
import { PriceTierListItemProps } from './types';
import './styles.scss';

interface StatsCommercialPurchaseProps {
	siteId: number | null;
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	adminUrl: string;
	redirectUri: string;
	from: string;
	showClassificationDispute?: boolean;
	priceTiers: [ PriceTierListItemProps ];
}

interface StatsSingleItemPagePurchaseProps {
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	redirectUri: string;
	from: string;
	siteId: number | null;
	isCommercial: boolean | null;
	priceTiers: [ PriceTierListItemProps ];
}

interface StatsSingleItemPersonalPurchasePageProps {
	siteSlug: string;
	redirectUri: string;
	from: string;
	siteId: number | null;
	maxSliderPrice: number;
	pwywProduct: {
		cost: number;
		currency_code: string;
	};
	disableFreeProduct: boolean;
}

interface StatsPersonalPurchaseProps {
	siteId: number | null;
	siteSlug: string;
	maxSliderPrice: number;
	pwywProduct: {
		cost: number;
		currency_code: string;
	};
	redirectUri: string;
	from: string;
	adminUrl: string;
	disableFreeProduct: boolean;
}

const COMPONENT_CLASS_NAME = 'stats-purchase-single';

const StatsCommercialPurchase = ( {
	siteId,
	siteSlug,
	planValue,
	currencyCode,
	from,
	adminUrl,
	redirectUri,
	showClassificationDispute = true,
	priceTiers,
}: StatsCommercialPurchaseProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );

	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;
	const [ isAdsChecked, setAdsChecked ] = useState( false );
	const [ isSellingChecked, setSellingChecked ] = useState( false );
	const [ isBusinessChecked, setBusinessChecked ] = useState( false );
	const [ isDonationChecked, setDonationChecked ] = useState( false );

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const handleClick = ( event: React.MouseEvent, isOdysseyStats: boolean ) => {
		event.preventDefault();

		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_commercial_update_classification_clicked` );

		const mailTo = isOdysseyStats ? 'support@jetpack.com' : 'help@wordpress.com';
		const emailSubject = translate( 'Jetpack Stats Commercial Classification Dispute' );
		const emailBody = `Hi Jetpack Team,\n
I'm writing to dispute the classification of my site '${ siteSlug }' as commercial.\n
I can confirm that,
- I don't have ads on my site.
- I don't sell products/services on my site.
- I don't promote a business on my site.
- I don't solicit donations or sponsorships on my site.\n
Could you please take a look at my site and update the classification if necessary?\n
Thanks\n\n`;
		const emailHref = `mailto:${ mailTo }?subject=${ encodeURIComponent(
			emailSubject
		) }&body=${ encodeURIComponent( emailBody ) }`;

		setTimeout( () => ( window.location.href = emailHref ), 250 );
	};

	// TODO: Replace current pricing info with slider.
	// Currently displaying below the flow to maintain existing behaviour.
	const isTierUpgradeSliderEnabled = config.isEnabled( 'stats/tier-upgrade-slider' );

	return (
		<>
			<h1>{ translate( 'Jetpack Stats' ) }</h1>
			<p>{ translate( 'The most advanced stats Jetpack has to offer.' ) }</p>
			<StatsBenefitsCommercial />
			<StatsCommercialPriceDisplay planValue={ planValue } currencyCode={ currencyCode } />
			<ButtonComponent
				variant="primary"
				primary={ isWPCOMSite ? true : undefined }
				onClick={ () =>
					gotoCheckoutPage( { from, type: 'commercial', siteSlug, adminUrl, redirectUri } )
				}
			>
				{ translate( 'Get Stats' ) }
			</ButtonComponent>
			{ isTierUpgradeSliderEnabled && (
				<TierUpgradeSlider priceTiers={ priceTiers } currencyCode={ currencyCode } />
			) }

			{ showClassificationDispute && (
				<div className={ `${ COMPONENT_CLASS_NAME }__additional-card-panel` }>
					<Panel className={ `${ COMPONENT_CLASS_NAME }__card-panel` }>
						<PanelBody title={ translate( 'This is not a commercial site' ) } initialOpen={ false }>
							<p>
								{ translate(
									'If you think we misidentified your site as commercial, confirm the information below, and we’ll take a look.'
								) }
							</p>
							<div className={ `${ COMPONENT_CLASS_NAME }__persnal-checklist` }>
								<ul>
									<li>
										<CheckboxControl
											className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
											checked={ isAdsChecked }
											label={ translate( `I don't have ads on my site` ) }
											onChange={ ( value: boolean ) => {
												setAdsChecked( value );
											} }
										/>
									</li>
									<li>
										<CheckboxControl
											className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
											checked={ isSellingChecked }
											label={ translate( `I don't sell products/services on my site` ) }
											onChange={ ( value: boolean ) => {
												setSellingChecked( value );
											} }
										/>
									</li>
									<li>
										<CheckboxControl
											className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
											checked={ isBusinessChecked }
											label={ translate( `I don't promote a business on my site` ) }
											onChange={ ( value: boolean ) => {
												setBusinessChecked( value );
											} }
										/>
									</li>
									<li>
										<CheckboxControl
											className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
											checked={ isDonationChecked }
											label={ translate( `I don't solicit donations or sponsorships on my site` ) }
											onChange={ ( value ) => {
												setDonationChecked( value );
											} }
										/>
									</li>
								</ul>
								{ isAdsChecked && isSellingChecked && isBusinessChecked && isDonationChecked && (
									<Button
										variant="secondary"
										disabled={
											! isAdsChecked ||
											! isSellingChecked ||
											! isBusinessChecked ||
											! isDonationChecked
										}
										onClick={ ( e: React.MouseEvent ) => handleClick( e, isOdysseyStats ) }
									>
										{ translate( 'Request update' ) }
									</Button>
								) }
							</div>
						</PanelBody>
					</Panel>
				</div>
			) }
		</>
	);
};

const StatsPersonalPurchase = ( {
	siteId,
	siteSlug,
	maxSliderPrice,
	pwywProduct,
	redirectUri,
	from,
	adminUrl,
	disableFreeProduct = false,
}: StatsPersonalPurchaseProps ) => {
	const translate = useTranslate();
	const sliderStepPrice = pwywProduct.cost / MIN_STEP_SPLITS;

	const steps = Math.floor( maxSliderPrice / sliderStepPrice );
	// We need the exact position, otherwise the caculated pricing would not be the same as the one in the slider.
	const defaultStartingValue = Math.floor( steps * DEFAULT_STARTING_FRACTION );
	const uiEmojiHeartTier = Math.floor( steps * UI_EMOJI_HEART_TIER_THRESHOLD );
	const uiImageCelebrationTier = steps * UI_IMAGE_CELEBRATION_TIER_THRESHOLD;

	const [ subscriptionValue, setSubscriptionValue ] = useState( defaultStartingValue );

	// change the plan to commercial on the personal plan confirmation
	const handlePlanSwap = ( e: React.MouseEvent ) => {
		e.preventDefault();
		recordTracksEvent( `calypso_stats_plan_switched_from_personal_to_commercial` );

		page( `/stats/purchase/${ siteSlug }?productType=commercial&flags=stats/type-detection` );
	};

	return (
		<>
			<h1>{ translate( 'Jetpack Stats' ) }</h1>
			<p>{ translate( 'The most advanced stats Jetpack has to offer.' ) }</p>
			<PersonalPurchase
				subscriptionValue={ subscriptionValue }
				setSubscriptionValue={ setSubscriptionValue }
				defaultStartingValue={ defaultStartingValue }
				handlePlanSwap={ ( e ) => handlePlanSwap( e ) }
				currencyCode={ pwywProduct?.currency_code }
				siteId={ siteId }
				siteSlug={ siteSlug }
				sliderSettings={ {
					minSliderPrice: disableFreeProduct ? sliderStepPrice : 0,
					sliderStepPrice,
					maxSliderPrice,
					uiEmojiHeartTier,
					uiImageCelebrationTier,
				} }
				adminUrl={ adminUrl }
				redirectUri={ redirectUri }
				from={ from }
				isStandalone={ true }
			/>
		</>
	);
};

const StatsSingleItemPersonalPurchasePage = ( {
	siteSlug,
	redirectUri,
	from,
	siteId,
	maxSliderPrice,
	pwywProduct,
	disableFreeProduct,
}: StatsSingleItemPersonalPurchasePageProps ) => {
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	return (
		<StatsSingleItemPagePurchaseFrame>
			<StatsPersonalPurchase
				siteId={ siteId }
				siteSlug={ siteSlug }
				adminUrl={ adminUrl || '' }
				redirectUri={ redirectUri }
				from={ from }
				maxSliderPrice={ maxSliderPrice }
				pwywProduct={ pwywProduct }
				disableFreeProduct={ disableFreeProduct }
			/>
		</StatsSingleItemPagePurchaseFrame>
	);
};

const StatsSingleItemPagePurchase = ( {
	siteSlug,
	planValue,
	currencyCode,
	redirectUri,
	from,
	siteId,
	isCommercial,
	priceTiers,
}: StatsSingleItemPagePurchaseProps ) => {
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	return (
		<StatsSingleItemPagePurchaseFrame>
			<StatsCommercialPurchase
				siteId={ siteId }
				siteSlug={ siteSlug }
				planValue={ planValue }
				currencyCode={ currencyCode }
				adminUrl={ adminUrl || '' }
				redirectUri={ redirectUri }
				from={ from }
				showClassificationDispute={ !! isCommercial }
				priceTiers={ priceTiers }
			/>
		</StatsSingleItemPagePurchaseFrame>
	);
};

export { StatsSingleItemPagePurchase, StatsSingleItemPersonalPurchasePage };
