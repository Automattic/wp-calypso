import { Button as CalypsoButton } from '@automattic/components';
import { Button, Card, Panel, PanelRow, PanelBody } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import statsPurchaseBackgroundSVG from 'calypso/assets/images/stats/purchase-background.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import getSiteAdminUrl from 'calypso/state/sites/selectors/get-site-admin-url';
import CommercialPurchase from './stats-purchase-commercial';
import PersonalPurchase from './stats-purchase-personal';
import StatsPurchaseSVG from './stats-purchase-svg';
import './styles.scss';

const COMPONENT_CLASS_NAME = 'stats-purchase-wizard';
const SCREEN_TYPE_SELECTION = 0;
const SCREEN_PURCHASE = 1;
const TYPE_PERSONAL = 'Personal';
const TYPE_COMMERCIAL = 'Commercial';

const DEFAULT_STARTING_FRACTION = 0.5;
const UI_EMOJI_HEART_TIER_THRESHOLD = 0.5;
const UI_IMAGE_CELEBRATION_TIER_THRESHOLD = 0.8;

// A step price is half of the smallest unit
const MIN_STEP_SPLITS = 2;

const TitleNode = ( { label, indicatorNumber, active } ) => {
	return (
		<>
			<div
				className={ classNames( `${ COMPONENT_CLASS_NAME }__card-title-indicator`, {
					active: active,
				} ) }
			>
				{ indicatorNumber }{ ' ' }
			</div>
			{ label }
		</>
	);
};

const ProductCard = ( {
	siteSlug,
	siteId,
	commercialProduct,
	maxSliderPrice,
	pwywProduct,
	redirectUri,
	from,
	disableFreeProduct = false,
	initialStep = SCREEN_TYPE_SELECTION,
	initialSiteType,
} ) => {
	const sliderStepPrice = pwywProduct.cost / MIN_STEP_SPLITS;

	const steps = Math.floor( maxSliderPrice / sliderStepPrice );
	// We need the exact position, otherwise the caculated pricing would not be the same as the one in the slider.
	const defaultStartingValue = Math.floor( steps * DEFAULT_STARTING_FRACTION );
	const uiEmojiHeartTier = Math.floor( steps * UI_EMOJI_HEART_TIER_THRESHOLD );
	const uiImageCelebrationTier = steps * UI_IMAGE_CELEBRATION_TIER_THRESHOLD;

	const [ subscriptionValue, setSubscriptionValue ] = useState( defaultStartingValue );
	const [ wizardStep, setWizardStep ] = useState( initialStep );
	const [ siteType, setSiteType ] = useState( initialSiteType );
	const translate = useTranslate();
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const personalLabel = translate( 'Personal site' );
	const commercialLabel = translate( 'Commercial site' );
	const personalProductTitle = translate( 'What is Jetpack Stats worth to you?' );
	const commercialProductTitle = translate( 'Upgrade your Jetpack Stats' );

	// Default titles for no site type selected.
	const typeSelectionScreenLabel = translate( 'Select your site type', {
		args: {
			site: siteSlug,
		},
	} );
	let purchaseScreenLabel = personalProductTitle;

	if ( siteType === TYPE_PERSONAL ) {
		purchaseScreenLabel = personalProductTitle;
	}

	if ( siteType === TYPE_COMMERCIAL ) {
		purchaseScreenLabel = commercialProductTitle;
	}

	const showCelebration =
		siteType &&
		wizardStep === SCREEN_PURCHASE &&
		( siteType === TYPE_COMMERCIAL || subscriptionValue >= uiImageCelebrationTier );

	const setPersonalSite = () => {
		recordTracksEvent( `calypso_stats_personal_plan_selected` );

		setSiteType( TYPE_PERSONAL );
		setWizardStep( SCREEN_PURCHASE );
	};

	const setCommercialSite = () => {
		recordTracksEvent( `calypso_stats_commercial_plan_selected` );

		setSiteType( TYPE_COMMERCIAL );
		setWizardStep( SCREEN_PURCHASE );
	};

	const toggleFirstStep = ( toggleState ) => {
		// Never close on click but allow to open when a type was selected (to change).
		if ( ! siteType || ! toggleState ) {
			return;
		}

		setWizardStep( SCREEN_TYPE_SELECTION );
		setSiteType( null );
	};

	// change the plan to commercial on the personal plan confirmation
	const handlePlanSwap = ( e ) => {
		e.preventDefault();
		recordTracksEvent( `calypso_stats_plan_switched_from_personal_to_commercial` );

		setCommercialSite();
	};

	const firstStepTitleNode = (
		<TitleNode
			indicatorNumber="1"
			label={ typeSelectionScreenLabel }
			active={ wizardStep === SCREEN_TYPE_SELECTION }
		/>
	);

	const secondStepTitleNode = (
		<TitleNode
			indicatorNumber="2"
			label={ purchaseScreenLabel }
			active={ wizardStep === SCREEN_PURCHASE }
		/>
	);

	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;

	return (
		<div className={ COMPONENT_CLASS_NAME }>
			<Card className={ `${ COMPONENT_CLASS_NAME }__card-parent` }>
				<div className={ `${ COMPONENT_CLASS_NAME }__card` }>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--left` }>
						<Panel className={ `${ COMPONENT_CLASS_NAME }__card-panel` } header="Jetpack Stats">
							<PanelBody
								title={ firstStepTitleNode }
								initialOpen
								onToggle={ ( shouldOpen ) => toggleFirstStep( shouldOpen ) }
								opened={ wizardStep === SCREEN_TYPE_SELECTION }
								className={ classNames( `${ COMPONENT_CLASS_NAME }__card-panel-title`, {
									[ `${ COMPONENT_CLASS_NAME }__card-panel--type-selected` ]: !! siteType,
								} ) }
							>
								<PanelRow>
									<div className={ `${ COMPONENT_CLASS_NAME }__card-grid` }>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-header--left` }>
											<h3>{ translate( 'Personal' ) }</h3>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-header--right` }>
											<h3>{ translate( 'Commercial' ) }</h3>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-body--left` }>
											<p>
												{ translate(
													`A hobby or personal site. You don't attempt to make money from your site in any way.`
												) }
											</p>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-body--right` }>
											<p>
												{ translate(
													`A site used for commercial activity. Your site sells or advertises a product or service.`
												) }
											</p>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-action--left` }>
											<ButtonComponent
												variant="primary"
												primary={ isWPCOMSite ? true : undefined }
												onClick={ setPersonalSite }
											>
												{ personalLabel }
											</ButtonComponent>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-action--right` }>
											<ButtonComponent
												variant="primary"
												primary={ isWPCOMSite ? true : undefined }
												onClick={ setCommercialSite }
											>
												{ commercialLabel }
											</ButtonComponent>
										</div>
									</div>
								</PanelRow>
							</PanelBody>
							{ siteType && wizardStep === SCREEN_PURCHASE && (
								<PanelBody
									title={ secondStepTitleNode }
									opened={ wizardStep === SCREEN_PURCHASE }
									className={ classNames( `${ COMPONENT_CLASS_NAME }__card-panel-title` ) }
								>
									<PanelRow>
										{ siteType === TYPE_PERSONAL ? (
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
										) : (
											<CommercialPurchase
												planValue={ commercialProduct?.cost }
												currencyCode={ commercialProduct?.currency_code }
												siteId={ siteId }
												siteSlug={ siteSlug }
												commercialProduct={ commercialProduct }
												adminUrl={ adminUrl }
												redirectUri={ redirectUri }
												from={ from }
											/>
										) }
									</PanelRow>
								</PanelBody>
							) }
						</Panel>
					</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right` }>
						<StatsPurchaseSVG
							isFree={ siteType === TYPE_PERSONAL && subscriptionValue === 0 }
							hasHighlight={ showCelebration }
							extraMessage={ showCelebration }
						/>
						<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right-background` }>
							<img src={ statsPurchaseBackgroundSVG } alt="Blurred background" />
						</div>
					</div>
				</div>
			</Card>
		</div>
	);
};

const StatsPurchaseWizard = ( {
	siteSlug,
	siteId,
	commercialProduct,
	maxSliderPrice,
	pwywProduct,
	redirectUri,
	from,
	disableFreeProduct,
	initialStep,
	initialSiteType,
} ) => {
	return (
		<ProductCard
			siteSlug={ siteSlug }
			siteId={ siteId }
			commercialProduct={ commercialProduct }
			maxSliderPrice={ maxSliderPrice }
			pwywProduct={ pwywProduct }
			redirectUri={ redirectUri }
			from={ from }
			disableFreeProduct={ disableFreeProduct }
			initialStep={ initialStep }
			initialSiteType={ initialSiteType }
		/>
	);
};

export {
	StatsPurchaseWizard as default,
	COMPONENT_CLASS_NAME,
	MIN_STEP_SPLITS,
	SCREEN_TYPE_SELECTION,
	SCREEN_PURCHASE,
	TYPE_PERSONAL,
	TYPE_COMMERCIAL,
	DEFAULT_STARTING_FRACTION,
	UI_EMOJI_HEART_TIER_THRESHOLD,
	UI_IMAGE_CELEBRATION_TIER_THRESHOLD,
};
