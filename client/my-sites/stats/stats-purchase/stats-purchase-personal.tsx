/* eslint-disable jsx-a11y/anchor-is-valid */
import { PricingSlider, RenderThumbFunction } from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { localizeUrl } from '@automattic/i18n-utils';
import { Button, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import { COMPONENT_CLASS_NAME, PRICING_CONFIG } from './stats-purchase-wizard';

interface PersonalPurchaseProps {
	subscriptionValue: number;
	setSubscriptionValue: ( value: number ) => number;
	handlePlanSwap: ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => void;
	currencyCode: string;
	siteSlug: string;
}

const PersonalPurchase = ( {
	subscriptionValue,
	setSubscriptionValue,
	handlePlanSwap,
	currencyCode,
	siteSlug,
}: PersonalPurchaseProps ) => {
	const translate = useTranslate();
	const [ isAdsChecked, setAdsChecked ] = useState( false );
	const [ isSellingChecked, setSellingChecked ] = useState( false );
	const [ isBusinessChecked, setBusinessChecked ] = useState( false );

	const sliderLabel = ( ( props, state ) => {
		let emoji;

		if ( subscriptionValue <= PRICING_CONFIG.EMOJI_HEART_TIER ) {
			emoji = String.fromCodePoint( 0x1f60a ); /* Smiling face emoji */
		} else if ( subscriptionValue < PRICING_CONFIG.IMAGE_CELEBRATION_PRICE ) {
			emoji = String.fromCodePoint( 0x2764, 0xfe0f ); /* Heart emoji */
		} else if ( subscriptionValue >= PRICING_CONFIG.IMAGE_CELEBRATION_PRICE ) {
			emoji = String.fromCodePoint( 0x1f525 ); /* Fire emoji */
		}

		return (
			<div { ...props }>
				{ translate( '%(value)s/month', {
					args: {
						value: formatCurrency( state?.valueNow || subscriptionValue, currencyCode ),
					},
					comment: 'Price per month selected by the user via the pricing slider',
				} ) }
				{ subscriptionValue > 0 && emoji }
			</div>
		);
	} ) as RenderThumbFunction;

	return (
		<div>
			<div className={ `${ COMPONENT_CLASS_NAME }__notice` }>
				{ translate(
					'This plan is for personal sites only. If your site is used for a commercial activity, {{Button}}you will need to choose a commercial plan{{/Button}}.',
					{
						components: {
							Button: <Button variant="link" href="#" onClick={ ( e ) => handlePlanSwap( e ) } />,
						},
					}
				) }
			</div>
			<PricingSlider
				className={ `${ COMPONENT_CLASS_NAME }__slider` }
				value={ subscriptionValue }
				renderThumb={ sliderLabel }
				onChange={ setSubscriptionValue }
				maxValue={ PRICING_CONFIG.MAX_SLIDER_PRICE }
				step={ PRICING_CONFIG.SLIDER_STEP }
			/>

			<p className={ `${ COMPONENT_CLASS_NAME }__average-price` }>
				{ translate( 'Our users pay %(value)s per month on average', {
					args: {
						value: formatCurrency( PRICING_CONFIG.AVERAGE_PRICE_INFO, currencyCode ),
					},
				} ) }
			</p>

			<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
				{ subscriptionValue === 0 ? (
					<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--not-included` }>
						<li>{ translate( 'No access to upcoming features' ) }</li>
						<li>{ translate( 'No priority support' ) }</li>
						<li>{ translate( "You'll see upsells and ads in the Stats page" ) }</li>
					</ul>
				) : (
					<>
						<p>{ translate( 'Benefits:' ) }</p>
						<ul className={ `${ COMPONENT_CLASS_NAME }__benefits--included` }>
							<li>{ translate( 'Instant access to upcoming features' ) }</li>
							<li>{ translate( 'Priority support' ) }</li>
							<li>{ translate( 'Ad-free experience' ) }</li>
						</ul>
					</>
				) }
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
					</ul>
				</div>
			) }

			<p>
				{ translate(
					`By clicking the button below, you agree to our {{a}}Terms of Service{{/a}} and to {{b}}share details{{/b}} with WordPress.com.`,
					{
						components: {
							a: (
								<Button
									variant="link"
									target="_blank"
									href={ localizeUrl( 'https://wordpress.com/tos/' ) }
								/>
							),
							b: <Button variant="link" href="#" />,
						},
					}
				) }
			</p>

			{ subscriptionValue === 0 ? (
				<Button
					variant="primary"
					disabled={ ! isAdsChecked || ! isSellingChecked || ! isBusinessChecked }
					onClick={ () => gotoCheckoutPage( 'free', siteSlug ) }
				>
					{ translate( 'Continue with Jetpack Stats for free' ) }
				</Button>
			) : (
				<Button
					variant="primary"
					onClick={ () => gotoCheckoutPage( 'pwyw', siteSlug, subscriptionValue ) }
				>
					{ translate( 'Get Jetpack Stats for %(value)s per month', {
						args: {
							value: formatCurrency( subscriptionValue, currencyCode ),
						},
					} ) }
				</Button>
			) }
		</div>
	);
};

export default PersonalPurchase;
