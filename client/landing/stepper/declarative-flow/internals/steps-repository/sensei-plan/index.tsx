/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { Plans } from 'calypso/../packages/data-stores/src';
import { SenseiStepContent, SENSEI_FLOW, StepContainer } from 'calypso/../packages/onboarding/src';
import { PlansIntervalToggle } from 'calypso/../packages/plans-grid/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import PlanItem from 'calypso/../packages/plans-grid/src/plans-table/plan-item';
import { useWPCOMPlugin } from 'calypso/data/marketplace/use-wpcom-plugins-query';
import { useNewSiteVisibility } from 'calypso/landing/gutenboarding/hooks/use-selected-plan';
import { PLANS_STORE } from 'calypso/landing/gutenboarding/stores/plans';
import {
	USER_STORE,
	ONBOARD_STORE,
	SITE_STORE,
	PRODUCTS_LIST_STORE,
} from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { getProductSlugByPeriodVariation } from 'calypso/lib/plugins/utils';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import type { Step } from '../../types';
import 'calypso/../packages/plans-grid/src/plans-grid/style.scss';
import 'calypso/../packages/plans-grid/src/plans-table/style.scss';

const SenseiPlan: Step = ( { flow } ) => {
	const [ billingPeriod, setBillingPeriod ] =
		React.useState< Plans.PlanBillingPeriod >( 'ANNUALLY' );
	const [ allPlansExpanded, setAllPlansExpanded ] = React.useState( true );

	const { __ } = useI18n();
	const locale = useLocale();
	const visibility = useNewSiteVisibility();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { supportedPlans, maxAnnualDiscount } = useSupportedPlans( locale, billingPeriod );
	const { createSenseiSite } = useDispatch( ONBOARD_STORE );
	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );
	const productList =
		useSelect( ( select ) => select( PRODUCTS_LIST_STORE ).getProductsList(), [] ) || {};
	const getPlanProduct = useSelect( ( select ) => select( PLANS_STORE ).getPlanProduct );
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );

	const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );

	const planObject = supportedPlans.find( ( plan ) => {
		return plan && 'business' === plan.periodAgnosticSlug;
	} );

	const handlePlanBillingPeriodChange = ( newBillingPeriod: Plans.PlanBillingPeriod ) => {
		setBillingPeriod( newBillingPeriod );
	};

	const { data: woothemesSenseiData } = useWPCOMPlugin( 'woothemes-sensei' );
	const variation =
		woothemesSenseiData?.variations?.[ billingPeriod === 'ANNUALLY' ? 'yearly' : 'monthly' ];
	const woothemesSenseiProductSlug = getProductSlugByPeriodVariation( variation, productList );

	const onPlanSelect = async () => {
		try {
			await createSenseiSite( {
				username: currentUser?.username || '',
				languageSlug: locale,
				visibility,
			} );

			const newSite = getNewSite();
			setIntentOnSite( newSite?.site_slug as string, SENSEI_FLOW );
			saveSiteSettings( newSite?.blogid as number, { launchpad_screen: 'full' } );

			const planProductObject = getPlanProduct( planObject?.periodAgnosticSlug, billingPeriod );

			const cartKey = await cartManagerClient.getCartKeyForSiteSlug( newSite?.site_slug as string );

			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const productsToAdd: any[] = [
				{
					product_slug: planProductObject?.storeSlug,
					extra: {
						signup_flow: flow,
					},
				},
				{
					product_slug: woothemesSenseiProductSlug,
					extra: {
						signup_flow: flow,
					},
				},
			];

			if ( domain && domain.product_slug ) {
				const registration = domainRegistration( {
					domain: domain.domain_name,
					productSlug: domain.product_slug as string,
					extra: { privacy_available: domain.supports_privacy },
				} );

				productsToAdd.push( registration );
			}

			await cartManagerClient.forCartKey( cartKey ).actions.addProductsToCart( productsToAdd );
			const redirectTo = encodeURIComponent(
				`/setup/senseiLaunch?flow=sensei&siteSlug=${ newSite?.site_slug }&siteId=${ newSite?.blogid }`
			);

			window.location.replace(
				`/checkout/${ newSite?.site_slug }?signup=1&redirect_to=${ redirectTo }`
			);
		} catch ( err ) {
			/**
			 * @todo Need to report user that something went wrong.
			 */
		}
	};

	return (
		<StepContainer
			stepName="senseiPlan"
			flowName={ SENSEI_FLOW }
			isWideLayout
			hideFormattedHeader
			recordTracksEvent={ recordTracksEvent }
			shouldHideNavButtons
			stepContent={
				<SenseiStepContent>
					<div className="plans-grid">
						<PlansIntervalToggle
							intervalType={ billingPeriod }
							onChange={ handlePlanBillingPeriodChange }
							maxMonthlyDiscountPercentage={ maxAnnualDiscount }
							className="plans-grid__toggle"
						/>

						<div className="plans-grid__table">
							<div className="plans-grid__table-container">
								<div className="plans-table">
									<span>
										<PlanItem
											popularBadgeVariation="ON_TOP"
											allPlansExpanded={ allPlansExpanded }
											slug="business"
											domain={ domain }
											CTAVariation="NORMAL"
											features={ planObject?.features ?? [] }
											billingPeriod={ billingPeriod }
											name="business"
											onSelect={ onPlanSelect }
											onPickDomainClick={ undefined }
											onToggleExpandAll={ () => setAllPlansExpanded( ( expand ) => ! expand ) }
											popularBadgeText={ __( 'Best for Video' ) }
										/>
									</span>
								</div>
							</div>
						</div>
					</div>
				</SenseiStepContent>
			}
		/>
	);
};

export default SenseiPlan;
