import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button as CalypsoButton } from '@automattic/components';
import { Button, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import { isJetpackSite, getSiteAdminUrl, getSiteOption } from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import useAvailableUpgradeTiers from '../hooks/use-available-upgrade-tiers';
import useOnDemandCommercialClassificationMutation from '../hooks/use-on-demand-site-identification-mutation';
import useSiteCompulsoryPlanSelectionQualifiedCheck from '../hooks/use-site-compulsory-plan-selection-qualified-check';
import useStatsPurchases from '../hooks/use-stats-purchases';
import { StatsCommercialUpgradeSlider, getTierQuentity } from './stats-commercial-upgrade-slider';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import PersonalPurchase from './stats-purchase-personal';
import {
	StatsCommercialPriceDisplay,
	StatsBenefitsCommercial,
	StatsSingleItemPagePurchaseFrame,
	StatsSingleItemCard,
} from './stats-purchase-shared';
import {
	MIN_STEP_SPLITS,
	DEFAULT_STARTING_FRACTION,
	UI_EMOJI_HEART_TIER_THRESHOLD,
	UI_IMAGE_CELEBRATION_TIER_THRESHOLD,
} from './stats-purchase-wizard';
import './styles.scss';

interface StatsCommercialPurchaseProps {
	siteId: number | null;
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	adminUrl: string;
	redirectUri: string;
	from: string;
}

interface StatsSingleItemPagePurchaseProps {
	siteSlug: string;
	planValue: number;
	currencyCode: string;
	redirectUri: string;
	from: string;
	siteId: number | null;
	isCommercial: boolean | null;
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

interface StatsCommercialFlowOptOutFormProps {
	siteId: number | null;
	siteSlug: string;
	isCommercial: boolean | null;
}

const COMPONENT_CLASS_NAME = 'stats-purchase-single';
const FLAGS_CHECKOUT_FLOWS_V2 = 'stats/checkout-flows-v2';

const StatsUpgradeInstructions = () => {
	const translate = useTranslate();
	return (
		<div>
			<p>
				{ translate(
					'Upgrade and increase your site views limit to continue using our advanced stats features.'
				) }
			</p>
			<div className="stats-purchase-wizard__notice">
				{ translate(
					'The remainder of your current plan will be credited towards the upgrade, ensuring you only pay the price difference. Starting from the next billing cycle, standard charges will apply.'
				) }
			</div>
		</div>
	);
};

function useLocalizedStrings( isCommercial: boolean ) {
	const translate = useTranslate();

	let pageTitle = '';
	let infoText = '';
	let continueButtonText = '';

	// Page title, info text, and button text depend on isCommercial status.
	if ( ! config.isEnabled( FLAGS_CHECKOUT_FLOWS_V2 ) ) {
		pageTitle = translate( 'Jetpack Stats' );
		infoText = translate( 'The most advanced stats Jetpack has to offer.' );
		continueButtonText = translate( 'Purchase' );
	} else {
		pageTitle = isCommercial
			? translate( 'Upgrade and continue using Jetpack Stats' )
			: translate( 'Simple yet powerful stats to grow your site' );
		infoText = isCommercial
			? translate(
					'To continue using Stats and access its newest premium features you need to get a commercial license.'
			  )
			: translate(
					"With Jetpack Stats, you don't need to be a data scientist to see how your site is performing. Get premium access to:"
			  );
		continueButtonText = isCommercial
			? translate( 'Upgrade and continue' )
			: translate( 'Get started now' );
	}
	return { pageTitle, infoText, continueButtonText };
}

const StatsCommercialPurchase = ( {
	siteId,
	siteSlug,
	planValue,
	currencyCode,
	from,
	adminUrl,
	redirectUri,
}: StatsCommercialPurchaseProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const isTierUpgradeSliderEnabled = config.isEnabled( 'stats/tier-upgrade-slider' );
	const tiers = useAvailableUpgradeTiers( siteId ) || [];
	const { isCommercialOwned } = useStatsPurchases( siteId );

	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;
	const startingTierQuantity = getTierQuentity( tiers[ 0 ], isTierUpgradeSliderEnabled );
	const [ purchaseTierQuantity, setPurchaseTierQuantity ] = useState( startingTierQuantity ?? 0 );

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const handleSliderChanged = useCallback( ( value: number ) => {
		setPurchaseTierQuantity( value );
	}, [] );

	// Page title, info text, and button text depend on isCommercial status.
	const isCommercial = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'is_commercial' )
	) as boolean;
	const { pageTitle, infoText, continueButtonText } = useLocalizedStrings( isCommercial );

	// TODO: Remove isTierUpgradeSliderEnabled code paths.

	return (
		<>
			<h1>{ pageTitle }</h1>
			{ ! isCommercialOwned && (
				<>
					<p>{ infoText }</p>
					<StatsBenefitsCommercial />
				</>
			) }
			{ isCommercialOwned && <StatsUpgradeInstructions /> }
			{ ! isTierUpgradeSliderEnabled && (
				<>
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
				</>
			) }
			{ isTierUpgradeSliderEnabled && (
				<>
					<StatsCommercialUpgradeSlider
						currencyCode={ currencyCode }
						analyticsEventName={ `${
							isOdysseyStats ? 'jetpack_odyssey' : 'calypso'
						}_stats_purchase_commercial_slider_clicked` }
						onSliderChange={ handleSliderChanged }
					/>
					<ButtonComponent
						variant="primary"
						primary={ isWPCOMSite ? true : undefined }
						onClick={ () =>
							gotoCheckoutPage( {
								from,
								type: 'commercial',
								siteSlug,
								adminUrl,
								redirectUri,
								price: undefined,
								quantity: purchaseTierQuantity,
							} )
						}
					>
						{ continueButtonText }
					</ButtonComponent>
				</>
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
		const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_plan_switched_from_personal_to_commercial` );

		page( `/stats/purchase/${ siteSlug }?productType=commercial&flags=stats/type-detection` );
	};

	const pageTitle = config.isEnabled( FLAGS_CHECKOUT_FLOWS_V2 )
		? translate( 'Name your price for Jetpack Stats' )
		: translate( 'Jetpack Stats' );

	return (
		<>
			<h1>{ pageTitle }</h1>
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
				isStandalone
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
}: StatsSingleItemPagePurchaseProps ) => {
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
	const { supportCommercialUse } = useStatsPurchases( siteId );
	const { isNewSite } = useSiteCompulsoryPlanSelectionQualifiedCheck( siteId );

	return (
		<>
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
			{ ! supportCommercialUse && ! ( isNewSite && isCommercial ) && (
				<StatsSingleItemCard>
					<StatsCommercialFlowOptOutForm
						isCommercial={ isCommercial }
						siteId={ siteId }
						siteSlug={ siteSlug }
					/>
				</StatsSingleItemCard>
			) }
		</>
	);
};

function StatsCommercialFlowOptOutForm( {
	isCommercial,
	siteId,
	siteSlug,
}: StatsCommercialFlowOptOutFormProps ) {
	const translate = useTranslate();
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isJetpackSupport: boolean = useSelector( ( state ) =>
		Boolean( isJetpackSite( state, siteId, { treatAtomicAsJetpackSite: false } ) )
	);
	const commercialReasons = useSelector( ( state ) =>
		getSiteOption( state, siteId, 'is_commercial_reasons' )
	) as string[];
	const COMMERCIAL_REASONS = {
		ads: translate( 'Ads' ),
		adsense: 'Adsense',
		taboola: 'Taboola',
		infolink: 'InfoLink',
		exoclick: 'ExoClick',
		'live-chat': translate( 'Live Chat' ),
		'commercial-dext': translate( 'Commercial Domain Extension' ),
		'contact-details': translate( 'Business Contact Details' ),
		'manual-override': translate( 'Manual Override' ),
		ecommerce: translate( 'Ecommerce' ),
	};
	const { supportsOnDemandCommercialClassification } = useSelector( ( state ) =>
		getEnvStatsFeatureSupportChecks( state, siteId )
	);

	// Checkbox state
	const [ isAdsChecked, setAdsChecked ] = useState( false );
	const [ isSellingChecked, setSellingChecked ] = useState( false );
	const [ isBusinessChecked, setBusinessChecked ] = useState( false );
	const [ isDonationChecked, setDonationChecked ] = useState( false );
	const [ comemercialClassificationRunAt, setComemercialClassificationRunAt ] = useState( 0 );
	const [ errorMessage, setErrorMessage ] = useState( '' );

	useEffect( () => {
		setComemercialClassificationRunAt(
			parseInt(
				localStorage?.getItem( `commercial_classification__button_clicked_${ siteId }` ) ?? '0'
			)
		);
	}, [ siteId ] );

	const handleSwitchToPersonalClick = () => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_commercial_switch_to_personal_clicked` );
		setTimeout( () => page( `/stats/purchase/${ siteSlug }?productType=personal` ), 250 );
	};

	const handleRequestUpdateClick = () => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_commercial_update_classification_clicked` );

		// For Jetpack sites, open the Jetpack support form. Do not prefill.
		if ( isJetpackSupport ) {
			window.open( `https://jetpack.com/contact-support/?url=${ siteSlug }` );
			return;
		}

		// For Dotcom sites, open the Dotcom help page.
		window.open( 'https://wordpress.com/help' );
	};

	const { mutateAsync: runCommercialClassificationAsync } =
		useOnDemandCommercialClassificationMutation( siteId );
	const handleCommercialClassification = async () => {
		const now = Date.now();
		localStorage?.setItem( `commercial_classification__button_clicked_${ siteId }`, `${ now }` );
		setComemercialClassificationRunAt( now );
		runCommercialClassificationAsync().catch( ( e ) => {
			setErrorMessage( e.message );
		} );
	};
	const commercialClassificationLastRunAt = useMemo(
		() =>
			parseInt(
				localStorage?.getItem( `commercial_classification__button_clicked_${ siteId }` ) ?? '0'
			),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[ comemercialClassificationRunAt, siteId ]
	);
	const canReverify = Date.now() - commercialClassificationLastRunAt > 1000 * 60 * 60 * 24 * 1; // 1 day
	const hasClassificationStarted = commercialClassificationLastRunAt > 0;
	const isClassificationInProgress =
		hasClassificationStarted && Date.now() - commercialClassificationLastRunAt < 1000 * 60 * 30; // half an hour
	const isClassificationFinished = hasClassificationStarted && ! isClassificationInProgress;

	const isFormSubmissionDisabled =
		! isAdsChecked || ! isSellingChecked || ! isBusinessChecked || ! isDonationChecked;

	// Message, button text, and handler differ based on isCommercial flag.
	const formMessage = isCommercial
		? translate(
				'Your site is identified as commercial, reasons being ’%(reasons)s’, which means it isn’t eligible for a non-commercial license. You can read more about {{link}}how we define a site as commercial{{/link}}. {{br/}}{{br/}} If you think this determination was made in error or you’ve made changes to comply with the non-commercial terms, you can request a reverification (this can be done once every 24 hours).',
				{
					args: {
						reasons:
							commercialReasons
								?.map(
									( reason: string ) =>
										COMMERCIAL_REASONS[ reason as keyof typeof COMMERCIAL_REASONS ] ?? reason
								)
								.join( ' and/or ' ) ?? 'Unknown',
					},
					components: {
						link: (
							<a
								target="_blank"
								href="https://jetpack.com/support/jetpack-stats/free-or-paid/#how-is-a-commercial-site-defined"
								rel="noreferrer noopener"
							/>
						),
						br: <br />,
					},
				}
		  )
		: translate( 'To use a non-commercial license you must agree to the following:' );

	return (
		<>
			<h1>{ translate( 'Continue with a non-commercial license' ) }</h1>
			<p>{ formMessage }</p>
			<div className={ `${ COMPONENT_CLASS_NAME }__personal-checklist` }>
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
			</div>
			<div className={ `${ COMPONENT_CLASS_NAME }__personal-checklist-button` }>
				{ ! isCommercial && (
					<Button
						variant="secondary"
						disabled={ isFormSubmissionDisabled }
						onClick={ handleSwitchToPersonalClick }
					>
						{ translate( 'Continue' ) }
					</Button>
				) }
				{ isCommercial && (
					<>
						{ supportsOnDemandCommercialClassification && (
							<Button
								variant="secondary"
								disabled={ ! canReverify || isFormSubmissionDisabled }
								onClick={ handleCommercialClassification }
							>
								{ translate( 'Reverify' ) }
							</Button>
						) }
						{ ( ! supportsOnDemandCommercialClassification ||
							isClassificationFinished ||
							errorMessage ) && (
							<Button variant="secondary" onClick={ handleRequestUpdateClick }>
								{ translate( 'Contact support' ) }
							</Button>
						) }
					</>
				) }
			</div>
			{ supportsOnDemandCommercialClassification && isCommercial && (
				<>
					{ errorMessage && (
						<p className={ `${ COMPONENT_CLASS_NAME }__error-msg` }>{ errorMessage }</p>
					) }
					{ isClassificationInProgress && ! errorMessage && (
						<p className={ `${ COMPONENT_CLASS_NAME }__error-msg` }>
							{ translate(
								'We are working on verifying your site… Please come back in about 30 minutes. You will have an option to contact support when the process is finished.'
							) }
						</p>
					) }
					{ isClassificationFinished && ! errorMessage && (
						<p className={ `${ COMPONENT_CLASS_NAME }__error-msg` }>
							{ translate(
								'We have finished verifying your site. If you still think this is an error, please contact support by clicking the button above.'
							) }
						</p>
					) }
				</>
			) }
		</>
	);
}

export { StatsSingleItemPagePurchase, StatsSingleItemPersonalPurchasePage };
