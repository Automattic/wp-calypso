/* eslint-disable jsx-a11y/anchor-is-valid */
import { Button, CheckboxControl, Card, Panel, PanelRow, PanelBody } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import CommercialPurchase from './stats-purchase-commercial';
import PersonalPurchase from './stats-purchase-personal';
import StatsPurchaseSVG from './stats-purchase-svg';
import './styles.scss';

const COMPONENT_CLASS_NAME = 'stats-purchase-wizard';
const SCREEN_TYPE_SELECTION = 0;
const SCREEN_PERSONAL_CHECKLIST = 1;
const SCREEN_PURCHASE = 2;
const TYPE_PERSONAL = 'Personal';
const TYPE_COMMERCIAL = 'Commercial';
const DEFAULT_STARTING_PRICE = 6;
const FLAT_COMMERCIAL_PRICE = 10;

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

const ProductCard = ( { siteSlug } ) => {
	const [ subscriptionValue, setSubscriptionValue ] = useState( DEFAULT_STARTING_PRICE );
	const [ wizardStep, setWizardStep ] = useState( SCREEN_TYPE_SELECTION );
	const [ siteType, setSiteType ] = useState( null );
	const [ isAdsChecked, setAdsChecked ] = useState( false );
	const [ isSellingChecked, setSellingChecked ] = useState( false );
	const [ isBusinessChecked, setBusinessChecked ] = useState( false );
	const translate = useTranslate();

	const personalLabel = translate( 'Personal site' );
	const commercialLabel = translate( 'Commercial site' );
	const selectedTypeLabel = siteType === TYPE_PERSONAL ? personalLabel : commercialLabel;

	const handleTypeClick = ( type ) => {
		setSiteType( type );
		setWizardStep( type === TYPE_PERSONAL ? SCREEN_PERSONAL_CHECKLIST : SCREEN_PURCHASE );
	};

	const toggleFirstStep = ( toggleState ) => {
		// Never close on click but allow to open when a type was selected (to change).
		if ( ! siteType || ! toggleState ) {
			return;
		}

		setWizardStep( SCREEN_TYPE_SELECTION );
	};

	// change the plan to commercial on the personal plan confirmation
	const handlePlanSwap = () => {
		setSiteType( TYPE_COMMERCIAL );
		setSubscriptionValue( FLAT_COMMERCIAL_PRICE );
		setWizardStep( SCREEN_PURCHASE );
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
			active={ wizardStep === SCREEN_TYPE_SELECTION || wizardStep === SCREEN_PERSONAL_CHECKLIST }
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
			<Card>
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
													`Sites and blogs used for hobby or personal use. Doesn't generate any money in a direct or an indirect way.`
												) }
											</p>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-body--right` }>
											<p>
												{ translate(
													`Sites and blogs used for commercial activities. Includes selling or advertising a product/service, person or business.`
												) }
											</p>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-action--left` }>
											<Button isPrimary onClick={ () => handleTypeClick( TYPE_PERSONAL ) }>
												{ translate( 'Personal site' ) }
											</Button>
										</div>
										<div className={ `${ COMPONENT_CLASS_NAME }__card-grid-action--right` }>
											<Button isPrimary onClick={ () => handleTypeClick( TYPE_COMMERCIAL ) }>
												{ translate( 'Commercial site' ) }
											</Button>
										</div>
									</div>
								</PanelRow>
							</PanelBody>
							<PanelBody opened={ wizardStep === SCREEN_PERSONAL_CHECKLIST }>
								<PanelRow>
									<div className="qualifications">
										<p>
											<strong>
												{ translate( 'Please confirm non-commercial usage by checking each box:' ) }
											</strong>
										</p>
										<p>
											<ul>
												<li>
													<CheckboxControl
														checked={ isAdsChecked }
														label={ translate( `I don't have ads on my site` ) }
														onChange={ ( value ) => {
															setAdsChecked( value );
														} }
													/>
												</li>
												<li>
													<CheckboxControl
														checked={ isSellingChecked }
														label={ translate( `I don't sell products/services on my site` ) }
														onChange={ ( value ) => {
															setSellingChecked( value );
														} }
													/>
												</li>
												<li>
													<CheckboxControl
														checked={ isBusinessChecked }
														label={ translate( `I don't promote a business on my site` ) }
														onChange={ ( value ) => {
															setBusinessChecked( value );
														} }
													/>
												</li>
											</ul>
										</p>
										<p>
											{ translate( `If your site doesn't meet these criteria, ` ) }
											<a href="#" onClick={ () => handlePlanSwap() }>
												{ translate( `you will need to use the commercial plan` ) }
											</a>
											.
										</p>
										<p>
											<Button
												isPrimary
												onClick={ () => setWizardStep( SCREEN_PURCHASE ) }
												disabled={ ! isAdsChecked || ! isSellingChecked || ! isBusinessChecked }
											>
												{ translate( 'Confirm personal site' ) }
											</Button>
										</p>
									</div>
								</PanelRow>
							</PanelBody>
							<PanelBody title={ secondStepTitleNode } opened={ wizardStep === SCREEN_PURCHASE }>
								<PanelRow>
									{ siteType === TYPE_PERSONAL ? (
										<PersonalPurchase
											subscriptionValue={ subscriptionValue }
											setSubscriptionValue={ setSubscriptionValue }
										/>
									) : (
										<CommercialPurchase planValue={ FLAT_COMMERCIAL_PRICE } />
									) }
								</PanelRow>
							</PanelBody>
						</Panel>
					</div>
					<div className={ `${ COMPONENT_CLASS_NAME }__card-inner--right` }>
						<StatsPurchaseSVG
							isFree={ subscriptionValue === 0 }
							hasHighlight={ subscriptionValue >= 40 }
							extraMessage={ subscriptionValue >= 90 }
						/>
					</div>
				</div>
			</Card>
		</div>
	);
};

const StatsPurchaseWizard = ( { siteSlug } ) => {
	return <ProductCard siteSlug={ siteSlug } />;
};

export { StatsPurchaseWizard as default, COMPONENT_CLASS_NAME };
