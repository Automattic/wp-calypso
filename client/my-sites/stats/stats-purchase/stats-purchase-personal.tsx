import {
	PricingSlider,
	RenderThumbFunction,
	Button as CalypsoButton,
} from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { Button, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import { COMPONENT_CLASS_NAME, MIN_STEP_SPLITS } from './stats-purchase-wizard';
import TierUpgradeSlider from './stats-purchase-tier-upgrade-slider';

interface PersonalPurchaseProps {
	subscriptionValue: number;
	setSubscriptionValue: ( value: number ) => void;
	defaultStartingValue: number;
	handlePlanSwap: ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => void;
	currencyCode: string;
	siteId: number | null;
	siteSlug: string;
	sliderSettings: {
		sliderStepPrice: number;
		minSliderPrice: number;
		maxSliderPrice: number;
		uiEmojiHeartTier: number;
		uiImageCelebrationTier: number;
	};
	adminUrl: string;
	redirectUri: string;
	from: string;
	isStandalone?: boolean;
}

const PersonalPurchase = ( {
	subscriptionValue,
	setSubscriptionValue,
	defaultStartingValue,
	handlePlanSwap,
	currencyCode,
	siteId,
	siteSlug,
	sliderSettings,
	adminUrl,
	redirectUri,
	from,
	isStandalone,
}: PersonalPurchaseProps ) => {
	const translate = useTranslate();
	const [ isAdsChecked, setAdsChecked ] = useState( false );
	const [ isSellingChecked, setSellingChecked ] = useState( false );
	const [ isBusinessChecked, setBusinessChecked ] = useState( false );
	const [ isDonationChecked, setDonationChecked ] = useState( false );
	const {
		sliderStepPrice,
		minSliderPrice,
		maxSliderPrice,
		uiEmojiHeartTier,
		uiImageCelebrationTier,
	} = sliderSettings;

	const sliderLabel = ( ( props, state ) => {
		let emoji;

		if ( subscriptionValue < uiEmojiHeartTier ) {
			emoji = String.fromCodePoint( 0x1f60a ); /* Smiling face emoji */
		} else if ( subscriptionValue < uiImageCelebrationTier ) {
			emoji = String.fromCodePoint( 0x2764, 0xfe0f ); /* Heart emoji */
		} else if ( subscriptionValue >= uiImageCelebrationTier ) {
			emoji = String.fromCodePoint( 0x1f525 ); /* Fire emoji */
		}

		return (
			<div { ...props }>
				{ translate( '%(value)s/month', {
					args: {
						value: formatCurrency(
							( state?.valueNow || subscriptionValue ) * sliderStepPrice,
							currencyCode
						),
					},
					comment: 'Price per month selected by the user via the pricing slider',
				} ) }
				{ ` ${ subscriptionValue > 0 ? emoji : '' }` }
			</div>
		);
	} ) as RenderThumbFunction;

	const handleClick = ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) =>
		handlePlanSwap( e );

	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;

	return (
		<div>
			<div className={ `${ COMPONENT_CLASS_NAME }__notice` }>
				{ translate(
					'This plan is for personal sites only. If your site is used for a commercial activity, {{Button}}you will need to choose a commercial plan{{/Button}}.',
					{
						components: {
							Button: <Button variant="link" href="#" onClick={ handleClick } />,
						},
					}
				) }
			</div>
			<TierUpgradeSlider />

			<PricingSlider
				className={ `${ COMPONENT_CLASS_NAME }__slider` }
				value={ subscriptionValue }
				renderThumb={ sliderLabel }
				onChange={ setSubscriptionValue }
				maxValue={ Math.floor( maxSliderPrice / sliderStepPrice ) }
				minValue={ Math.round( minSliderPrice / sliderStepPrice ) }
			/>

			<p className={ `${ COMPONENT_CLASS_NAME }__average-price` }>
				{ translate( 'Our users pay %(value)s per month on average', {
					args: {
						value: formatCurrency( defaultStartingValue * sliderStepPrice, currencyCode ),
					},
				} ) }
			</p>

			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				<ul>
					{ subscriptionValue > 0 ? (
						<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
							{ translate( 'Instant access to upcoming features' ) }
						</li>
					) : (
						<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
							{ translate( 'No access to upcoming features' ) }
						</li>
					) }
					{ subscriptionValue >= defaultStartingValue ? (
						<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
							{ translate( 'Priority support' ) }
						</li>
					) : (
						<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
							{ translate( 'No priority support' ) }
						</li>
					) }
				</ul>
			</div>

			{ subscriptionValue === 0 && (
				<div className={ `${ COMPONENT_CLASS_NAME }__persnal-checklist` }>
					<p>
						<strong>
							{ translate( 'Please confirm non-commercial usage by checking each box:' ) }
						</strong>
					</p>
					<ul>
						<li>
							<CheckboxControl
								className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
								checked={ isAdsChecked }
								label={ translate( `I don't have ads on my site` ) }
								onChange={ ( value ) => {
									setAdsChecked( value );
								} }
							/>
						</li>
						<li>
							<CheckboxControl
								className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
								checked={ isSellingChecked }
								label={ translate( `I don't sell products/services on my site` ) }
								onChange={ ( value ) => {
									setSellingChecked( value );
								} }
							/>
						</li>
						<li>
							<CheckboxControl
								className={ `${ COMPONENT_CLASS_NAME }__control--checkbox` }
								checked={ isBusinessChecked }
								label={ translate( `I don't promote a business on my site` ) }
								onChange={ ( value ) => {
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
			) }

			{ subscriptionValue === 0 ? (
				<ButtonComponent
					variant="primary"
					primary={ isWPCOMSite ? true : undefined }
					disabled={
						! isAdsChecked || ! isSellingChecked || ! isBusinessChecked || ! isDonationChecked
					}
					onClick={ () =>
						gotoCheckoutPage( { from, type: 'free', siteSlug, adminUrl, redirectUri } )
					}
				>
					{ translate( 'Continue with Jetpack Stats for free' ) }
				</ButtonComponent>
			) : (
				<ButtonComponent
					variant="primary"
					primary={ isWPCOMSite ? true : undefined }
					onClick={ () =>
						gotoCheckoutPage( {
							from,
							type: 'pwyw',
							siteSlug,
							adminUrl,
							redirectUri,
							price: subscriptionValue / MIN_STEP_SPLITS,
						} )
					}
				>
					{ isStandalone ? translate( 'Get Stats' ) : translate( 'Get Jetpack Stats' ) }
				</ButtonComponent>
			) }
		</div>
	);
};

export default PersonalPurchase;
