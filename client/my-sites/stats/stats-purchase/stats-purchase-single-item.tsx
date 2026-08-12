import config from '@automattic/calypso-config';
import {
	getPlan,
	PLAN_JETPACK_COMPLETE,
	PLAN_JETPACK_GROWTH_YEARLY,
	PLAN_JETPACK_BUSINESS,
} from '@automattic/calypso-products';
import page from '@automattic/calypso-router';
import { Button as CalypsoButton } from '@automattic/components';
import { formatNumberCompact } from '@automattic/number-formatters';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { useJetpackConnectionStatus } from 'calypso/my-sites/stats/hooks/use-jetpack-connection-status';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { getSiteAdminUrl, getSiteOption, getIsSimpleSite } from 'calypso/state/sites/selectors';
import useAvailableUpgradeTiers from '../hooks/use-available-upgrade-tiers';
import usePlanUsageQuery, { getUsageLimitStatus } from '../hooks/use-plan-usage-query';
import useStatsPurchases from '../hooks/use-stats-purchases';
import useDismissPricingGrid from '../pricing-grid/hooks/use-dismiss-pricing-grid';
import { StatsCommercialUpgradeSlider, getTierQuantity } from './stats-commercial-upgrade-slider';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import {
	MIN_STEP_SPLITS,
	DEFAULT_STARTING_FRACTION,
	UI_EMOJI_HEART_TIER_THRESHOLD,
	UI_IMAGE_CELEBRATION_TIER_THRESHOLD,
} from './stats-purchase-consts';
import PersonalPurchase from './stats-purchase-personal';
import { StatsBenefitsCommercial, StatsSingleItemPagePurchaseFrame } from './stats-purchase-shared';
import './styles.scss';

interface StatsCommercialPurchaseProps {
	siteId: number | null;
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	adminUrl: string;
	redirectUri: string;
	from: string;
	/**
	 * Replaces what "I will do it later" does. The default returns to the site's own dashboard and
	 * records the dismissal server-side, neither of which a site with no WordPress.com connection
	 * can do.
	 */
	onPostpone?: () => void;
	/**
	 * Replaces the label that goes with `onPostpone`. A site that is not connected yet has
	 * something to do before it can come back to this, so it is not simply putting it off.
	 */
	postponeLabel?: string;
}

interface StatsSingleItemPagePurchaseProps {
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	redirectUri: string;
	from: string;
	siteId: number | null;
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

// A site could in theory hold more than one bundled plan purchase at once (e.g. mid-upgrade);
// prefer naming the highest tier since that's the more relevant entitlement to call out.
// The yearly slugs are used as stand-ins for their plan family (yearly vs. monthly share the
// same title), since only the title is read from the returned plan object.
export const getBundledPlanSlug = ( {
	isCompletePlanOwned,
	isGrowthPlanOwned,
	isBusinessPlanOwned,
}: {
	isCompletePlanOwned: boolean;
	isGrowthPlanOwned: boolean;
	isBusinessPlanOwned: boolean;
} ): string | undefined => {
	if ( isCompletePlanOwned ) {
		return PLAN_JETPACK_COMPLETE;
	} else if ( isGrowthPlanOwned ) {
		return PLAN_JETPACK_GROWTH_YEARLY;
	} else if ( isBusinessPlanOwned ) {
		return PLAN_JETPACK_BUSINESS;
	}
	return undefined;
};

const getBundledPlanNoticeText = (
	translate: ReturnType< typeof useTranslate >,
	planName: string,
	viewsLimit?: number
) =>
	viewsLimit
		? translate(
				'Your %(planName)s plan already includes %(viewsLimit)s views per month for Stats. Views from this purchase will stack on top, so you keep what you already have.',
				{ args: { planName, viewsLimit: formatNumberCompact( viewsLimit ) } }
		  )
		: translate(
				'Your %(planName)s plan already includes views for Stats. Views from this purchase will stack on top, so you keep what you already have.',
				{ args: { planName } }
		  );

const StatsUpgradeInstructions = ( {
	isNearLimit,
	isOverLimit,
	bundledPlanName,
}: {
	isNearLimit: boolean;
	isOverLimit: boolean;
	bundledPlanName?: string;
} ) => {
	const translate = useTranslate();

	let leadText;
	if ( isOverLimit ) {
		leadText = translate(
			'Your site has reached its views limit. Upgrade your tier to restore full access to advanced stats features.'
		);
	} else if ( isNearLimit ) {
		leadText = translate(
			'Your site is close to its monthly views limit. Upgrade your tier now to avoid any disruption to advanced stats features.'
		);
	} else {
		leadText = translate(
			'Upgrade and increase your site views limit to continue using our advanced stats features.'
		);
	}

	return (
		<div>
			<div className="stats-purchase-wizard__notice">
				{ bundledPlanName && <p>{ getBundledPlanNoticeText( translate, bundledPlanName ) }</p> }
				<p>
					{ translate(
						'The remainder of your current plan will be credited towards the upgrade, ensuring you only pay the price difference. Starting from the next billing cycle, standard charges will apply.'
					) }
				</p>
			</div>
			<p>{ leadText }</p>
		</div>
	);
};

const StatsBundledPlanNotice = ( {
	viewsLimit,
	planName,
}: {
	viewsLimit?: number;
	planName: string;
} ) => {
	const translate = useTranslate();

	return (
		<div className="stats-purchase-wizard__notice">
			<p>{ getBundledPlanNoticeText( translate, planName, viewsLimit ) }</p>
		</div>
	);
};

const useLocalizedStrings = ( isCommercial: boolean ) => {
	const translate = useTranslate();

	// Page title, info text, and button text depend on isCommercial status of site.
	if ( isCommercial ) {
		return {
			pageTitle: translate( 'Upgrade %(product)s to unlock premium features', {
				args: { product: STATS_PRODUCT_NAME },
			} ),
			infoText: translate(
				'Unlock UTM stats, device stats, and region and city stats with a paid plan.',
				{
					context: 'Stats: Descriptive text in the purchase flow',
				}
			),
			continueButtonText: translate( 'Upgrade now and continue' ),
		};
	}

	return {
		pageTitle: translate( 'Simple, yet powerful stats to grow your site' ),
		infoText: translate(
			'%(product)s makes it easy to see how your site is doing. No data science skills needed. Start with a paid plan and get premium access to:',
			{ args: { product: STATS_PRODUCT_NAME } }
		),
		continueButtonText: translate( 'Get Stats to grow my site' ),
	};
};

const StatsCommercialPurchase = ( {
	siteId,
	siteSlug,
	currencyCode,
	from,
	adminUrl,
	redirectUri,
	onPostpone,
	postponeLabel,
}: StatsCommercialPurchaseProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const tiers = useAvailableUpgradeTiers( siteId ) || [];
	const haveTiers = tiers.length > 0;
	const {
		isCommercialOwned,
		hasAnyStatsPlan,
		isCompletePlanOwned,
		isGrowthPlanOwned,
		isBusinessPlanOwned,
	} = useStatsPurchases( siteId );
	const isSimpleSite = useSelector( ( state ) => getIsSimpleSite( state, siteId ) );
	const { data: connectionStatus } = useJetpackConnectionStatus( siteId, !! isSimpleSite );
	const { data: usageData } = usePlanUsageQuery( siteId );

	// Site already has Stats access via a bundled plan (e.g. Jetpack Complete), independent of
	// whether it has also purchased standalone Stats — both stack, so both notices can co-render.
	const bundledPlanSlug = getBundledPlanSlug( {
		isCompletePlanOwned,
		isGrowthPlanOwned,
		isBusinessPlanOwned,
	} );
	const bundledPlanTitle = bundledPlanSlug ? getPlan( bundledPlanSlug )?.getTitle() : undefined;
	// "Jetpack" is a brand name, not translated; bundledPlanTitle is already a translated plan title.
	// getTitle() is typed to return TranslateResult (which can be a React element), but the three
	// bundled plans handled here never pass `components`, so it's always a plain string — guard
	// with typeof rather than assuming, since it also flows into a sprintf-style translate() call
	// downstream that only supports strings.
	const bundledPlanName =
		typeof bundledPlanTitle === 'string' ? `Jetpack ${ bundledPlanTitle }` : undefined;

	const { isNearLimit, isOverLimit } = getUsageLimitStatus( usageData );

	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;
	const startingTierQuantity = haveTiers ? getTierQuantity( tiers[ 0 ] ) : 0;
	const [ purchaseTierQuantity, setPurchaseTierQuantity ] = useState( startingTierQuantity ?? 0 );

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const needsConnectionForUpgrade =
		hasAnyStatsPlan && isOdysseyStats && ! connectionStatus?.isSiteFullyConnected;

	/*
	 * Putting the decision off is only what the secondary button offers once the site is fully
	 * connected. Short of that, taking the free plan still needs an account attached, so the
	 * button says so and goes and gets one.
	 *
	 * Deliberately narrow: only when we are in wp-admin AND have an answer about the connection.
	 * Simple and Atomic sites are always connected and report nothing here, and an absent answer
	 * must not be read as "not connected".
	 */
	const needsConnectionForFreePlan =
		isOdysseyStats && !! connectionStatus && ! connectionStatus.isSiteFullyConnected;

	const handleSliderChanged = useCallback( ( value: number ) => {
		setPurchaseTierQuantity( value );
	}, [] );

	const dismissPricingGrid = useDismissPricingGrid( siteId );

	const handleCheckoutPostponed = () => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_commercial_skip_button_clicked`, {
			blog_id: siteId,
			from,
		} );

		if ( onPostpone ) {
			onPostpone();
			return;
		}

		if ( needsConnectionForFreePlan ) {
			// Where the notice above sends anyone who still has to connect.
			window.location.href = `${ adminUrl }admin.php?page=my-jetpack#/connection`;
			return;
		}

		// Skipping is the visitor's plan decision — made on a page that shows the full
		// paid pitch — so the pricing grid mustn't take over the dashboard afterwards,
		// regardless of how they got here. On sites where the grid never shows this is
		// a harmless no-op.
		dismissPricingGrid();

		setTimeout( () => {
			page( `/stats/day/${ siteSlug }` );
		}, 250 );
	};

	const isCommercial = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'is_commercial' )
	) as boolean;
	const { pageTitle, infoText, continueButtonText } = useLocalizedStrings( isCommercial );

	const tierSelectionElements = haveTiers ? (
		<>
			<p>{ translate( 'Pick your Stats tier below:' ) }</p>
			<StatsCommercialUpgradeSlider
				tiers={ tiers }
				currencyCode={ currencyCode }
				analyticsEventName={ `${
					isOdysseyStats ? 'jetpack_odyssey' : 'calypso'
				}_stats_purchase_commercial_slider_clicked` }
				onSliderChange={ handleSliderChanged }
			/>
		</>
	) : (
		<p>
			{ translate(
				'Unable to load plan tiers. Please make sure you have an active network connection and try reloading the page.'
			) }
		</p>
	);

	return (
		<>
			<h1>{ pageTitle }</h1>
			{ bundledPlanName && ! isCommercialOwned && (
				<StatsBundledPlanNotice
					viewsLimit={ usageData?.views_limit }
					planName={ bundledPlanName }
				/>
			) }
			{ ! isCommercialOwned && (
				<>
					{ /* Hidden for bundled-plan sites: it contradicts the "already includes" notice above. */ }
					{ ! bundledPlanName && <p>{ infoText }</p> }
					<StatsBenefitsCommercial />
				</>
			) }
			{ isCommercialOwned && (
				<StatsUpgradeInstructions
					isNearLimit={ isNearLimit }
					isOverLimit={ isOverLimit }
					bundledPlanName={ bundledPlanName }
					// `usageData.views_limit` is the site's total stacked limit (bundled + standalone)
					// once both are owned, so it can't be attributed to the bundled plan alone here.
				/>
			) }
			{ tierSelectionElements }
			{ needsConnectionForUpgrade && (
				<div className="stats-purchase-wizard__notice connection-notice">
					{ translate( 'Please {{link}}connect your user account{{/link}} to upgrade Stats.', {
						components: {
							link: <a href={ `${ adminUrl }admin.php?page=my-jetpack#/connection` } />,
						},
					} ) }
				</div>
			) }
			<div className="stats-purchase-wizard__actions">
				<ButtonComponent
					variant="primary"
					primary={ isWPCOMSite ? true : undefined }
					disabled={ ! haveTiers || needsConnectionForUpgrade }
					onClick={ () =>
						gotoCheckoutPage( {
							from,
							type: 'commercial',
							siteSlug,
							siteId,
							adminUrl,
							redirectUri,
							price: undefined,
							quantity: purchaseTierQuantity,
							isUpgrade: hasAnyStatsPlan, // All cross grades are not possible for the site-only flow.
							isSiteFullyConnected: !! connectionStatus?.isSiteFullyConnected,
						} )
					}
				>
					{ continueButtonText }
				</ButtonComponent>
				<ButtonComponent variant="secondary" onClick={ handleCheckoutPostponed }>
					{ postponeLabel ??
						( needsConnectionForFreePlan
							? translate( 'Start for free' )
							: translate( 'I will do it later' ) ) }
				</ButtonComponent>
			</div>
			<div className="stats-purchase-page__footnotes">
				<p>{ translate( '(*) 14-day money-back guarantee' ) }</p>
			</div>
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
		const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_plan_switched_from_personal_to_commercial`, {
			blog_id: siteId,
		} );

		page( `/stats/purchase/${ siteSlug }?productType=commercial&from=switch-from-personal` );
	};

	return (
		<>
			<h1>
				{ translate( 'Support %(product)s and name your price', {
					args: { product: STATS_PRODUCT_NAME },
				} ) }
			</h1>
			<p>
				{ translate( 'Help %(product)s and get these perks:', {
					args: { product: STATS_PRODUCT_NAME },
				} ) }
			</p>
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
			/>
		</StatsSingleItemPagePurchaseFrame>
	);
};

export {
	StatsSingleItemPagePurchase,
	StatsSingleItemPersonalPurchasePage,
	// Exported for Odyssey's pre-connection screen, which composes the same commercial pitch into
	// its own frame rather than the site-scoped purchase page.
	StatsCommercialPurchase,
};
