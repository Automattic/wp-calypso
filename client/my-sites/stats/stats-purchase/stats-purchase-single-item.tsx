import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button as CalypsoButton } from '@automattic/components';
import { Button, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { useJetpackConnectionStatus } from 'calypso/my-sites/stats/hooks/use-jetpack-connection-status';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import {
	isJetpackSite,
	getSiteAdminUrl,
	getSiteOption,
	getIsSimpleSite,
} from 'calypso/state/sites/selectors';
import getEnvStatsFeatureSupportChecks from 'calypso/state/sites/selectors/get-env-stats-feature-supports';
import { JETPACK_BLOG_ABOUT_COMMERCIAL_STATS_URL } from '../const';
import useAvailableUpgradeTiers from '../hooks/use-available-upgrade-tiers';
import useOnDemandCommercialClassificationMutation from '../hooks/use-on-demand-site-identification-mutation';
import useSiteCompulsoryPlanSelectionQualifiedCheck from '../hooks/use-site-compulsory-plan-selection-qualified-check';
import useStatsPurchases from '../hooks/use-stats-purchases';
import { StatsCommercialUpgradeSlider, getTierQuantity } from './stats-commercial-upgrade-slider';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import {
	MIN_STEP_SPLITS,
	DEFAULT_STARTING_FRACTION,
	UI_EMOJI_HEART_TIER_THRESHOLD,
	UI_IMAGE_CELEBRATION_TIER_THRESHOLD,
} from './stats-purchase-consts';
import PersonalPurchase from './stats-purchase-personal';
import {
	StatsBenefitsCommercial,
	StatsSingleItemPagePurchaseFrame,
	StatsSingleItemCard,
} from './stats-purchase-shared';
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

const useLocalizedStrings = ( isCommercial: boolean ) => {
	const translate = useTranslate();

	// Page title, info text, and button text depend on isCommercial status of site.
	if ( isCommercial ) {
		return {
			pageTitle: translate( 'Upgrade and continue using %(product)s', {
				args: { product: STATS_PRODUCT_NAME },
			} ),
			infoText: translate(
				'To continue using Stats and access its newest premium features you need to get a commercial license. {{link}}Learn more about this update{{/link}}.',
				{
					comment: '{{link}} links to explainer post on Jetpack blog.',
					components: {
						link: <a href={ JETPACK_BLOG_ABOUT_COMMERCIAL_STATS_URL } />,
					},
					context: 'Stats: Descriptive text in the commercial purchase flow',
				}
			),
			continueButtonText: translate( 'Upgrade now and continue' ),
		};
	}

	return {
		pageTitle: translate( 'Simple, yet powerful stats to grow your site' ),
		infoText: translate(
			'%(product)s makes it easy to see how your site is doing. No data science skills needed. Start with a commercial license and get premium access to:',
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
}: StatsCommercialPurchaseProps ) => {
	const translate = useTranslate();
	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	const tiers = useAvailableUpgradeTiers( siteId ) || [];
	const haveTiers = tiers.length > 0;
	const { isCommercialOwned, hasAnyStatsPlan } = useStatsPurchases( siteId );
	const isSimpleSite = useSelector( ( state ) => getIsSimpleSite( state, siteId ) );
	const { data: connectionStatus } = useJetpackConnectionStatus( siteId, !! isSimpleSite );

	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;
	const startingTierQuantity = haveTiers ? getTierQuantity( tiers[ 0 ] ) : 0;
	const [ purchaseTierQuantity, setPurchaseTierQuantity ] = useState( startingTierQuantity ?? 0 );

	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );

	const needsConnectionForUpgrade =
		hasAnyStatsPlan && isOdysseyStats && ! connectionStatus?.isSiteFullyConnected;

	const handleSliderChanged = useCallback( ( value: number ) => {
		setPurchaseTierQuantity( value );
	}, [] );

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
			{ ! isCommercialOwned && (
				<>
					<p>{ infoText }</p>
					<StatsBenefitsCommercial />
				</>
			) }
			{ isCommercialOwned && <StatsUpgradeInstructions /> }
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
		recordTracksEvent( `${ event_from }_stats_plan_switched_from_personal_to_commercial` );

		page( `/stats/purchase/${ siteSlug }?productType=commercial&from=switch-from-personal` );
	};

	return (
		<>
			<h1>
				{ translate( 'Support %(product)s and set your price', {
					args: { product: STATS_PRODUCT_NAME },
				} ) }
			</h1>
			<p>
				{ translate( 'Help %(product)s with a non-commercial license and get these perks:', {
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
		'promotes-service': translate( 'Promotion of Service' ),
		ecommerce: translate( 'Ecommerce' ),
		donations: translate( 'Donations' ),
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
		setTimeout(
			() =>
				page( `/stats/purchase/${ siteSlug }?productType=personal&from=switch-from-commercial` ),
			250
		);
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
		: translate(
				'For non-commercial use, get started with a non-commercial license, including an optional contribution. Please agree to the following terms:'
		  );

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
