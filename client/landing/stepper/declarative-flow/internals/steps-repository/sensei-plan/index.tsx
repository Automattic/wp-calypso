/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useLocale } from '@automattic/i18n-utils';
import { useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import classnames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import formatCurrency from 'calypso/../packages/format-currency/src';
import PlanItem from 'calypso/../packages/plans-grid/src/plans-table/plan-item';
import FormattedHeader from 'calypso/components/formatted-header';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import PlanPrice from 'calypso/my-sites/plan-price';
import { SenseiStepContainer } from '../components/sensei-step-container';
import { SenseiStepError } from '../components/sensei-step-error';
import { SenseiStepProgress } from '../components/sensei-step-progress';
import { PlansIntervalToggle } from './components';
import { useFeatures, Status } from './constants';
import { useCreateSenseiSite } from './create-sensei-site';
import { useBusinessPlanPricing, useSenseiProPricing } from './sensei-plan-products';
import type { Step } from '../../types';
import type { NewSiteBlogDetails, OnboardSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { PlanBillingPeriod } from 'calypso/../packages/data-stores';

import 'calypso/../packages/plans-grid/src/plans-table/style.scss';
import './styles.scss';

const SenseiPlan: Step = ( { flow, navigation: { submit } } ) => {
	const [ billingPeriod, setBillingPeriod ] = useState< PlanBillingPeriod >( 'ANNUALLY' );
	const [ status, setStatus ] = useState< Status >( Status.Initial );
	const locale = useLocale();
	const { __, hasTranslation } = useI18n();
	const translate = useTranslate();
	const features = useFeatures();

	const domain = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		[]
	);

	const senseiProPlan = useSenseiProPricing( billingPeriod );
	const businessPlan = useBusinessPlanPricing( billingPeriod );

	const goToDomainStep = useCallback( () => {
		submit?.( undefined, 'senseiDomain' );
	}, [ submit ] );

	const { createAndConfigureSite, progress } = useCreateSenseiSite();

	const createCheckoutCart = useCallback(
		async ( site?: NewSiteBlogDetails ) => {
			const cartKey = await cartManagerClient.getCartKeyForSiteSlug( site?.site_slug ?? '' );

			const productsToAdd: MinimalRequestCartProduct[] = [
				{
					product_slug: businessPlan.productSlug,
					extra: {
						signup_flow: flow,
					},
				},
				{
					product_slug: senseiProPlan.productSlug,
					extra: {
						signup_flow: flow,
					},
				},
			];

			if ( domain && domain.product_slug ) {
				const registration = domainRegistration( {
					domain: domain.domain_name,
					productSlug: domain.product_slug,
					extra: { privacy_available: domain.supports_privacy },
				} );

				productsToAdd.push( registration );
			}

			await cartManagerClient.forCartKey( cartKey ).actions.addProductsToCart( productsToAdd );
			const redirectTo = encodeURIComponent(
				`/setup/sensei/senseiPurpose?siteSlug=${ site?.site_slug }&siteId=${ site?.blogid }`
			);

			return `/checkout/${ site?.site_slug }?signup=1&redirect_to=${ redirectTo }`;
		},
		[ businessPlan.productSlug, domain, flow, senseiProPlan.productSlug ]
	);

	const onPlanSelect = async () => {
		try {
			setStatus( Status.Bundling );

			// Wait for a bit to get an animation in the beginning of site creation.
			await new Promise( ( res ) => setTimeout( res, 100 ) );

			const { site } = await createAndConfigureSite();
			const checkoutUrl = await createCheckoutCart( site );

			return window.location.assign( checkoutUrl );
		} catch ( err ) {
			setStatus( Status.Error );
		}
	};

	const currencyCode = senseiProPlan.currencyCode;
	const isLoading = ! businessPlan.monthlyPrice || ! senseiProPlan.monthlyPrice;
	const price = businessPlan.price + senseiProPlan.price;
	const monthlyPrice = businessPlan.monthlyPrice + senseiProPlan.monthlyPrice;
	const annualPrice = businessPlan.yearlyPrice + senseiProPlan.yearlyPrice;
	const annualPriceStr = formatCurrency( annualPrice, currencyCode, { stripZeros: true } );
	const annualSavings = monthlyPrice * 12 - annualPrice;
	const annualSavingsStr = formatCurrency( annualSavings, currencyCode, { stripZeros: true } );
	const domainSavings = domain?.raw_price || 0;
	const annualDiscount =
		100 - Math.floor( ( annualPrice / ( monthlyPrice * 12 + domainSavings ) ) * 100 );

	// translators: %s is the cost per year (e.g "billed as 96$ annually")
	const newPlanItemPriceLabelAnnually = __( 'per month, billed as %s annually' );

	const fallbackPlanItemPriceLabelAnnually = __( 'per month, billed annually' );

	const planItemPriceLabelAnnually =
		locale === 'en' || hasTranslation?.( 'per month, billed as %s annually' )
			? sprintf( newPlanItemPriceLabelAnnually, annualPriceStr )
			: fallbackPlanItemPriceLabelAnnually;

	const planItemPriceLabelMonthly = sprintf(
		// translators: %s is the annual savings
		__( 'Save %s by paying annually' ),
		annualSavingsStr
	);
	const title = __( 'Sensei Bundle' );

	return (
		<SenseiStepContainer
			stepName="senseiPlan"
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={
				status === Status.Initial && (
					<FormattedHeader
						headerText={ __( "There's a plan for you." ) }
						subHeaderText={ __(
							'Sensei + WooCommerce + Jetpack + WordPress.com in the ultimate Course Bundle'
						) }
						align="center"
					/>
				)
			}
		>
			{ status === Status.Initial && (
				<>
					<PlansIntervalToggle
						intervalType={ billingPeriod }
						onChange={ setBillingPeriod }
						maxMonthlyDiscountPercentage={ annualDiscount }
					/>

					<div className="plan-item-wrapper">
						<div
							className={ classnames( 'plan-item plan-item--sensei', {
								'plan-item--is-loading': isLoading,
							} ) }
						>
							<div tabIndex={ 0 } role="button" className="plan-item__summary">
								<div className="plan-item__heading">
									<div className="plan-item__name">{ title }</div>
								</div>
								<div className="plan-item__price">
									{ ! isLoading && (
										<PlanPrice rawPrice={ price ?? undefined } currencyCode={ currencyCode } />
									) }
								</div>
							</div>
							<div className="plan-item__price-note">
								{ ! isLoading && billingPeriod === 'ANNUALLY'
									? planItemPriceLabelAnnually
									: planItemPriceLabelMonthly }
							</div>
						</div>
						<PlanItem
							allPlansExpanded
							slug="business"
							domain={ domain }
							CTAVariation="NORMAL"
							features={ features }
							billingPeriod={ billingPeriod }
							name={ title }
							onSelect={ onPlanSelect }
							onPickDomainClick={ goToDomainStep }
							CTAButtonLabel={ __( 'Get Sensei Pro Bundle' ) }
						/>
					</div>

					<footer className="footer">
						<p>
							{ translate( 'Hosting by {{a}}WordPress.com{{/a}}', {
								components: {
									a: <a href="https://wordpress.com/" target="_blank" rel="noreferrer" />,
								},
							} ) }
						</p>
						<p>
							{ translate( 'Course creation and LMS tools powered by {{a}}SenseiLMS.com{{/a}}', {
								components: {
									a: <a href="https://senseilms.com/" target="_blank" rel="noreferrer" />,
								},
							} ) }
						</p>
					</footer>
				</>
			) }
			{ status === Status.Bundling && <SenseiStepProgress progress={ progress } /> }
			{ status === Status.Error && <SenseiStepError /> }
		</SenseiStepContainer>
	);
};

export default SenseiPlan;
