import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import {
	PricingSlider,
	RenderThumbFunction,
	Button as CalypsoButton,
} from '@automattic/components';
import formatCurrency from '@automattic/format-currency';
import { Button, CheckboxControl } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React, { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import useNoticeVisibilityMutation from 'calypso/my-sites/stats/hooks/use-notice-visibility-mutation';
import { useNoticeVisibilityQuery } from 'calypso/my-sites/stats/hooks/use-notice-visibility-query';
import useStatsPurchases from 'calypso/my-sites/stats/hooks/use-stats-purchases';
import { useSelector } from 'calypso/state';
import getIsSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';
import gotoCheckoutPage from './stats-purchase-checkout-redirect';
import { COMPONENT_CLASS_NAME, MIN_STEP_SPLITS } from './stats-purchase-consts';
import StatsPWYWUpgradeSlider from './stats-pwyw-uprade-slider';
import { StatsPWYWSliderSettings } from './types';

interface PersonalPurchaseProps {
	subscriptionValue: number;
	setSubscriptionValue: ( value: number ) => void;
	defaultStartingValue: number;
	handlePlanSwap: ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) => void;
	currencyCode: string;
	siteId: number | null;
	siteSlug: string;
	sliderSettings: StatsPWYWSliderSettings;
	adminUrl: string;
	redirectUri: string;
	from: string;
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
}: PersonalPurchaseProps ) => {
	const translate = useTranslate();
	const [ isAdsChecked, setAdsChecked ] = useState( false );
	const [ isSellingChecked, setSellingChecked ] = useState( false );
	const [ isBusinessChecked, setBusinessChecked ] = useState( false );
	const [ isDonationChecked, setDonationChecked ] = useState( false );
	const [ isPostponeBusy, setPostponeBusy ] = useState( false );
	const {
		sliderStepPrice,
		minSliderPrice,
		maxSliderPrice,
		uiEmojiHeartTier,
		uiImageCelebrationTier,
	} = sliderSettings;
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const isTierUpgradeSliderEnabled = config.isEnabled( 'stats/tier-upgrade-slider' );
	const { hasAnyStatsPlan } = useStatsPurchases( siteId );

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

	const isWPCOMSite = useSelector( ( state ) => siteId && getIsSiteWPCOM( state, siteId ) );
	// The button of @automattic/components has built-in color scheme support for Calypso.
	const ButtonComponent = isWPCOMSite ? CalypsoButton : Button;
	// TODO: Remove old slider code paths.
	const showOldSlider = ! isTierUpgradeSliderEnabled;

	const continueButtonText = translate( 'Contribute now and continue' );
	const { refetch: refetchNotices } = useNoticeVisibilityQuery( siteId, 'focus_jetpack_purchase' );
	const { mutateAsync: mutateNoticeVisbilityAsync } = useNoticeVisibilityMutation(
		siteId,
		'focus_jetpack_purchase',
		'postponed',
		4 * 7 * 24 * 3600 // four weeks
	);

	const handleClick = ( e: React.MouseEvent< HTMLAnchorElement, MouseEvent > ) =>
		handlePlanSwap( e );

	const handleSliderChanged = ( index: number ) => {
		// TODO: Remove state from caller.
		// Caller expects an index but doesn't do anything with it.
		// Value is used below to determine tier price.
		setSubscriptionValue( index );
	};

	const handleCheckoutRedirect = () => {
		gotoCheckoutPage( {
			from,
			type: 'pwyw',
			siteSlug,
			adminUrl,
			redirectUri,
			price: subscriptionValue / MIN_STEP_SPLITS,
			isUpgrade: hasAnyStatsPlan, // All cross grades are not possible for the site-only flow.
		} );
	};

	const handleCheckoutPostponed = () => {
		setPostponeBusy( true );

		mutateNoticeVisbilityAsync()
			.then( refetchNotices )
			.finally( () => {
				// publish event
				const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
				recordTracksEvent( `${ event_from }_stats_purchase_flow_skip_button_clicked` );

				// redirect to the Traffic page
				setTimeout( () => {
					setPostponeBusy( false );
					page( `/stats/day/${ siteSlug }` );
				}, 250 );
			} );
	};

	return (
		<div>
			<StatsBenefitsListing
				subscriptionValue={ subscriptionValue }
				defaultStartingValue={ defaultStartingValue }
			/>

			<div className={ `${ COMPONENT_CLASS_NAME }__notice` }>
				{ translate(
					'This plan is for non-commercial sites only. Sites with any commercial activity {{Button}}require a commercial license{{/Button}}.',
					{
						components: {
							Button: <Button variant="link" href="#" onClick={ handleClick } />,
						},
					}
				) }
			</div>

			{ showOldSlider && (
				<>
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
				</>
			) }

			{ isTierUpgradeSliderEnabled && (
				<StatsPWYWUpgradeSlider
					settings={ sliderSettings }
					currencyCode={ currencyCode }
					analyticsEventName={ `${
						isOdysseyStats ? 'jetpack_odyssey' : 'calypso'
					}_stats_purchase_pwyw_slider_clicked` }
					defaultStartingValue={ defaultStartingValue }
					onSliderChange={ handleSliderChanged }
				/>
			) }

			{ subscriptionValue === 0 && (
				<div className={ `${ COMPONENT_CLASS_NAME }__personal-checklist` }>
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
				<div className={ `${ COMPONENT_CLASS_NAME }__actions` }>
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
				</div>
			) : (
				<div className={ `${ COMPONENT_CLASS_NAME }__actions` }>
					<ButtonComponent
						variant="primary"
						primary={ isWPCOMSite ? true : undefined }
						onClick={ handleCheckoutRedirect }
					>
						{ continueButtonText }
					</ButtonComponent>

					<ButtonComponent
						variant="secondary"
						isBusy={ isWPCOMSite ? undefined : isPostponeBusy } // for <Button />
						busy={ isWPCOMSite ? isPostponeBusy : undefined } // for <CalypsoButton />
						onClick={ handleCheckoutPostponed }
					>
						{ translate( 'I will do it later' ) }
					</ButtonComponent>
				</div>
			) }
		</div>
	);
};

interface StatsBenefitsListingProps {
	subscriptionValue: number;
	defaultStartingValue: number;
}

function StatsBenefitsListing( {
	subscriptionValue,
	defaultStartingValue,
}: StatsBenefitsListingProps ) {
	const translate = useTranslate();
	return (
		<div className={ `${ COMPONENT_CLASS_NAME }__benefits` }>
			<ul>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
					{ translate( 'Real-time data on visitors' ) }
				</li>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
					{ translate( 'Traffic stats and trends for posts and pages' ) }
				</li>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
					{ translate( 'Detailed statistics about links leading to your site' ) }
				</li>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
					{ translate( 'GDPR compliance' ) }
				</li>
				{ subscriptionValue >= defaultStartingValue ? (
					<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--included` }>
						{ translate( 'Email support' ) }
					</li>
				) : (
					<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
						{ translate( 'No Email support' ) }
					</li>
				) }
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
					{ translate( 'No UTM tracking for your marketing campaigns' ) }
				</li>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
					{ translate( 'No access to upcoming advanced features' ) }
				</li>
			</ul>
		</div>
	);
}

export default PersonalPurchase;
