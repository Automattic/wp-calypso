import config from '@automattic/calypso-config';
import page from '@automattic/calypso-router';
import { Button } from '@wordpress/components';
import { useTranslate } from 'i18n-calypso';
import React from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { STATS_PRODUCT_NAME } from 'calypso/my-sites/stats/constants';
import { useJetpackConnectionStatus } from 'calypso/my-sites/stats/hooks/use-jetpack-connection-status';
import useStatsPurchases from 'calypso/my-sites/stats/hooks/use-stats-purchases';
import useDismissPricingGrid from 'calypso/my-sites/stats/pricing-grid/hooks/use-dismiss-pricing-grid';
import { useSelector } from 'calypso/state';
import getIsSimpleSite from 'calypso/state/sites/selectors/is-simple-site';
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
	const isOdysseyStats = config.isEnabled( 'is_running_in_jetpack_site' );
	const { hasAnyStatsPlan } = useStatsPurchases( siteId );
	const isSimpleSite = useSelector( ( state ) => getIsSimpleSite( state, siteId ) );
	const { data: connectionStatus } = useJetpackConnectionStatus( siteId, !! isSimpleSite );

	const continueButtonText = translate( 'Contribute now and continue' );

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
			siteId,
			adminUrl,
			redirectUri,
			price: subscriptionValue / MIN_STEP_SPLITS,
			isUpgrade: hasAnyStatsPlan, // All cross grades are not possible for the site-only flow.
			isSiteFullyConnected: !! connectionStatus?.isSiteFullyConnected,
		} );
	};

	const dismissPricingGrid = useDismissPricingGrid( siteId );

	const handleCheckoutPostponed = () => {
		const event_from = isOdysseyStats ? 'jetpack_odyssey' : 'calypso';
		recordTracksEvent( `${ event_from }_stats_purchase_flow_skip_button_clicked`, {
			blog_id: siteId,
			from,
		} );

		// Skipping is the visitor's plan decision — made on a page that shows the full
		// paid pitch — so the pricing grid mustn't take over the dashboard afterwards,
		// regardless of how they got here. On sites where the grid never shows this is
		// a harmless no-op.
		dismissPricingGrid();

		// redirect to the Traffic page
		setTimeout( () => {
			page( `/stats/day/${ siteSlug }` );
		}, 250 );
	};

	return (
		<div>
			<StatsBenefitsListing
				subscriptionValue={ subscriptionValue }
				defaultStartingValue={ defaultStartingValue }
			/>

			<div className={ `${ COMPONENT_CLASS_NAME }__notice` }>
				{ translate(
					'To unlock device stats, region and city stats and UTM tracking, {{Button}}upgrade to a paid plan{{/Button}}.',
					{
						components: {
							Button: <Button variant="link" href="#" onClick={ handleClick } />,
						},
					}
				) }
			</div>

			<StatsPWYWUpgradeSlider
				settings={ sliderSettings }
				currencyCode={ currencyCode }
				analyticsEventName={ `${
					isOdysseyStats ? 'jetpack_odyssey' : 'calypso'
				}_stats_purchase_pwyw_slider_clicked` }
				defaultStartingValue={ defaultStartingValue }
				onSliderChange={ handleSliderChanged }
			/>

			{ subscriptionValue === 0 ? (
				<div className={ `${ COMPONENT_CLASS_NAME }__actions` }>
					<Button
						variant="primary"
						onClick={ () =>
							gotoCheckoutPage( {
								from,
								type: 'free',
								siteSlug,
								siteId,
								adminUrl,
								redirectUri,
								isSiteFullyConnected: connectionStatus?.isSiteFullyConnected,
							} )
						}
					>
						{ translate( 'Continue with %(product)s for free', {
							args: { product: STATS_PRODUCT_NAME },
						} ) }
					</Button>
				</div>
			) : (
				<div className={ `${ COMPONENT_CLASS_NAME }__actions` }>
					<Button variant="primary" onClick={ handleCheckoutRedirect }>
						{ continueButtonText }
					</Button>

					<Button variant="secondary" onClick={ handleCheckoutPostponed }>
						{ translate( 'I will do it later' ) }
					</Button>
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
					{ translate( 'No region and city stats' ) }
				</li>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
					{ translate( 'No device stats' ) }
				</li>
				<li className={ `${ COMPONENT_CLASS_NAME }__benefits-item--not-included` }>
					{ translate( 'No access to upcoming advanced features' ) }
				</li>
			</ul>
		</div>
	);
}

export default PersonalPurchase;
