/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, Card, Panel, PanelRow, PanelBody } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import statsPurchaseBackgroundSVG from 'calypso/assets/images/stats/purchase-background.svg';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSelector } from 'calypso/state';
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

const DEFAULT_STARTING_FRACTION = 0.6;
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
	pwywProduct,
	redirectUri,
	from,
	initialStep,
	initialSiteType,
} ) => {
	const maxSliderPrice = commercialProduct.cost;
	const sliderStepPrice = pwywProduct.cost / MIN_STEP_SPLITS;

	const steps = Math.floor( maxSliderPrice / sliderStepPrice );
	// We need the exact position, otherwise the caculated pricing would not be the same as the one in the slider.
	const defaultStartingValue = Math.floor( steps * DEFAULT_STARTING_FRACTION );
	const uiEmojiHeartTier = steps * UI_EMOJI_HEART_TIER_THRESHOLD;
	const uiImageCelebrationTier = steps * UI_IMAGE_CELEBRATION_TIER_THRESHOLD;

	const [ subscriptionValue, setSubscriptionValue ] = useState( defaultStartingValue );
	const [ wizardStep, setWizardStep ] = useState( initialStep );
	const [ siteType, setSiteType ] = useState( initialSiteType );
	const translate = useTranslate();
	const adminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const personalLabel = translate( 'Personal site' );
	const commercialLabel = translate( 'Commercial site' );
	const selectedTypeLabel = siteType === TYPE_PERSONAL ? personalLabel : commercialLabel;

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
			label={
				! siteType
					? translate( 'What site type is %(site)s?', {
							args: {
								site: siteSlug,
							},
					  } )
					: selectedTypeLabel
			}
			active={ wizardStep === SCREEN_TYPE_SELECTION }
		/>
	);

	const secondStepTitleNode = (
		<TitleNode
			indicatorNumber="2"
			label={ translate( 'What is Jetpack Stats worth to you?' ) }
			active={ wizardStep === SCREEN_PURCHASE }
		/>
	);

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
											<Button variant="primary" onClick={ setPersonalSite }>
												{ translate( 'Personal site' ) }
											</Button>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-action--right` }>
											<Button variant="primary" onClick={ setCommercialSite }>
												{ translate( 'Commercial site' ) }
											</Button>
										</div>
									</div>
								</PanelRow>
							</PanelBody>
							<PanelBody title={ secondStepTitleNode } opened={ wizardStep === SCREEN_PURCHASE }>
								<PanelRow>
									{ siteType === TYPE_PERSONAL ? (
										<PersonalPurchase
											subscriptionValue={ subscriptionValue }
											setSubscriptionValue={ setSubscriptionValue }
											defaultStartingValue={ defaultStartingValue }
											handlePlanSwap={ ( e ) => handlePlanSwap( e ) }
											currencyCode={ pwywProduct?.currency_code }
											siteSlug={ siteSlug }
											sliderSettings={ {
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
											siteSlug={ siteSlug }
											commercialProduct={ commercialProduct }
											adminUrl={ adminUrl }
											redirectUri={ redirectUri }
											from={ from }
										/>
									) }
								</PanelRow>
							</PanelBody>
						</Panel>
					</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right` }>
						<StatsPurchaseSVG
							isFree={ siteType === TYPE_PERSONAL && subscriptionValue === 0 }
							hasHighlight={
								siteType === TYPE_COMMERCIAL || subscriptionValue >= uiImageCelebrationTier
							}
							extraMessage={
								siteType === TYPE_COMMERCIAL || subscriptionValue >= uiImageCelebrationTier
							}
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
	pwywProduct,
	redirectUri,
	from,
	initialStep,
	initialSiteType,
} ) => {
	return (
		<ProductCard
			siteSlug={ siteSlug }
			siteId={ siteId }
			commercialProduct={ commercialProduct }
			pwywProduct={ pwywProduct }
			redirectUri={ redirectUri }
			from={ from }
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
};
