/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { Plans } from 'calypso/../packages/data-stores/src';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { PlansIntervalToggle } from 'calypso/../packages/plans-grid/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import PlanItem from 'calypso/../packages/plans-grid/src/plans-table/plan-item';
import FormattedHeader from 'calypso/components/formatted-header';
import { PLANS_STORE } from 'calypso/landing/gutenboarding/stores/plans';
import { USER_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import CalypsoShoppingCartProvider from 'calypso/my-sites/checkout/calypso-shopping-cart-provider';
import type { Step } from '../../types';

import { useNewSiteVisibility } from 'calypso/landing/gutenboarding/hooks/use-selected-plan';
import { addDomainToCart, addPlanToCart } from 'calypso/lib/signup/step-actions';

import 'calypso/../packages/plans-grid/src/plans-grid/style.scss';
import 'calypso/../packages/plans-grid/src/plans-table/style.scss';
import './style.scss';
import { getDomainProductSlug } from 'calypso/lib/domains';
import { domainRegistration, planItem } from 'calypso/lib/cart-values/cart-items';
import { useStore } from 'react-redux';

const ChooseAPlan: Step = function ChooseAPlan( { navigation, flow } ) {
	const { goNext, goBack, submit } = navigation;
	const isVideoPressFlow = 'videopress' === flow;
	const { __ } = useI18n();
	const locale = useLocale();

	const visibility = useNewSiteVisibility();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { createSite } = useDispatch( ONBOARD_STORE );

	const store = useStore();

	const [ billingPeriod, setBillingPeriod ] =
		React.useState< Plans.PlanBillingPeriod >( 'ANNUALLY' );
	const [ selectedPlanProductId, setSelectedPlanProductId ] = React.useState< number | undefined >(
		undefined
	);
	const [ allPlansExpanded, setAllPlansExpanded ] = React.useState( true );

	const domain = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDomain() );
	const getPlanProduct = useSelect( ( select ) => select( PLANS_STORE ).getPlanProduct );
	const { supportedPlans, maxAnnualDiscount } = useSupportedPlans( locale, billingPeriod );

	const getDefaultStepContent = () => <h1>Choose a plan step</h1>;

	const getVideoPressFlowStepContent = () => {
		const filteredPlans = supportedPlans.filter( ( plan ) => {
			return (
				plan && ( 'premium' === plan.periodAgnosticSlug || 'business' === plan.periodAgnosticSlug )
			);
		} );

		console.log( supportedPlans );

		const onPlanSelect = ( planId: number | undefined ) => {
			/// @todo lock UI

			//setSelectedPlanProductId( planId );

			createSite( {
				username: currentUser!.username,
				languageSlug: locale,
				bearerToken: undefined,
				visibility,
				anchorFmPodcastId: null,
				anchorFmEpisodeId: null,
				anchorFmSpotifyUrl: null,
			} )
			.then( ( newSite ) => {
				const planObject = supportedPlans.find( ( plan ) => plan.productIds.indexOf( planId as number ) >= 0 );
				if ( ! planObject ) {
					///@todo whatever
					return;
				}
				console.log( 'We have the plan object !' );
				addPlanToCart(
					() => {
						submit?.( { newSite } );
					},
					{},
					{ cartItem: { product_slug: planObject.periodAgnosticSlug } },
					store
				);
				/*
				const productSlug = getDomainProductSlug( domain );
				const domainItem = domainRegistration( { productSlug, domain: domain!.domain_name } );

				addDomainToCart(
					( error: any ) => {
						if (error) {
							///@todo whatever
							return;
						}

						const planObject = supportedPlans.find( ( plan ) => planId as number in plan.productIds );
						if ( ! planObject ) {
							///@todo whatever
							return;
						}

						
					},
					{ domainItem }
				);*/
			} );
		};

		return (
			<CalypsoShoppingCartProvider>
				<div className="plans-grid">
					<PlansIntervalToggle
						intervalType={ billingPeriod }
						onChange={ setBillingPeriod }
						maxMonthlyDiscountPercentage={ maxAnnualDiscount }
						className="plans-grid__toggle"
					/>

					<div className="plans-grid__table">
						<div className="plans-grid__table-container">
							<div className="plans-table">
								{ filteredPlans
									.filter( ( plan ) => !! plan )
									.map( ( plan, index ) => (
										<>
											<PlanItem
												popularBadgeVariation={ 'ON_TOP' }
												allPlansExpanded={ allPlansExpanded }
												key={ plan.periodAgnosticSlug }
												slug={ plan.periodAgnosticSlug }
												domain={ domain }
												CTAVariation={ 'NORMAL' }
												features={ plan.features ?? [] }
												billingPeriod={ billingPeriod }
												isPopular={ 'business' === plan.periodAgnosticSlug }
												isFree={ plan.isFree }
												name={ plan?.title.toString() }
												isSelected={
													!! selectedPlanProductId &&
													selectedPlanProductId ===
														getPlanProduct( plan.periodAgnosticSlug, billingPeriod )?.productId
												}
												onSelect={ onPlanSelect }
												onPickDomainClick={ undefined }
												onToggleExpandAll={ () => setAllPlansExpanded( ( expand ) => ! expand ) }
												CTAButtonLabel={ __( 'Get %s' ).replace( '%s', plan.title ) }
												popularBadgeText={ __( 'Best for Video' ) }
											/>
											{ index < filteredPlans.length - 1 && <div className="plan-separator"></div> }
										</>
									) ) }
							</div>
						</div>
					</div>
				</div>
			</CalypsoShoppingCartProvider>
		);
	};

	const getFormattedHeader = () => {
		if ( ! isVideoPressFlow ) {
			return undefined;
		}

		return (
			<FormattedHeader
				id={ 'choose-a-plan-header' }
				headerText="Choose a plan"
				subHeaderText={ __( 'Unlock a powerful bundle of features for your video site.' ) }
				align={ 'center' }
			/>
		);
	};

	const stepContent = isVideoPressFlow ? getVideoPressFlowStepContent() : getDefaultStepContent();

	return (
		<StepContainer
			stepName={ 'chooseAPlan' }
			shouldHideNavButtons={ isVideoPressFlow }
			goBack={ goBack }
			goNext={ goNext }
			isHorizontalLayout={ false }
			isWideLayout={ true }
			isLargeSkipLayout={ false }
			stepContent={ stepContent }
			recordTracksEvent={ recordTracksEvent }
			formattedHeader={ getFormattedHeader() }
		/>
	);
};

export default ChooseAPlan;
