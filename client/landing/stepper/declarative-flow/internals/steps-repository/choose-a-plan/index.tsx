/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useLocale } from '@automattic/i18n-utils';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useSelect, useDispatch } from '@wordpress/data';
import { sprintf } from '@wordpress/i18n';
import { useI18n } from '@wordpress/react-i18n';
import React from 'react';
import { StepContainer } from 'calypso/../packages/onboarding/src';
import { PlansIntervalToggle } from 'calypso/../packages/plans-grid/src';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import PlanItem from 'calypso/../packages/plans-grid/src/plans-table/plan-item';
import FormattedHeader from 'calypso/components/formatted-header';
import { PLANS_STORE } from 'calypso/landing/gutenboarding/stores/plans';
import { useNewSiteVisibility } from 'calypso/landing/stepper/hooks/use-selected-plan';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import type { Step } from '../../types';
import type {
	Plans,
	PlansSelect,
	PlanSimplifiedFeature,
	OnboardSelect,
	SiteSelect,
	UserSelect,
} from '@automattic/data-stores';

import 'calypso/../packages/plans-grid/src/plans-grid/style.scss';
import 'calypso/../packages/plans-grid/src/plans-table/style.scss';
import './style.scss';

const ChooseAPlan: Step = function ChooseAPlan( { navigation, flow } ) {
	const { goNext, goBack, submit, goToStep } = navigation;
	const isVideoPressFlow = 'videopress' === flow;

	const [ billingPeriod, setBillingPeriod ] =
		React.useState< Plans.PlanBillingPeriod >( 'ANNUALLY' );
	const [ selectedPlanProductId, setSelectedPlanProductId ] = React.useState< number | undefined >(
		undefined
	);
	const [ allPlansExpanded, setAllPlansExpanded ] = React.useState( true );
	const [ isUIDisabled, setIsUIDisabled ] = React.useState( false );

	const { __ } = useI18n();
	const locale = useLocale();
	const visibility = useNewSiteVisibility();
	const { supportedPlans, maxAnnualDiscount } = useSupportedPlans( locale, billingPeriod );

	const currentUser = useSelect(
		( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
		[]
	);
	const domain = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDomain(),
		[]
	);
	const siteDescription = useSelect(
		( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteDescription(),
		[]
	);
	const getPlanProduct = useSelect(
		( select ) => ( select( PLANS_STORE ) as PlansSelect ).getPlanProduct,
		[]
	);
	const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );

	const { createVideoPressSite, setSelectedSite, setPendingAction, setProgress } =
		useDispatch( ONBOARD_STORE );
	const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );

	const getDefaultStepContent = () => <h1>Choose a plan step</h1>;

	const getVideoPressFlowStepContent = () => {
		const filteredPlans = supportedPlans.filter( ( plan ) => {
			return (
				plan && ( 'premium' === plan.periodAgnosticSlug || 'business' === plan.periodAgnosticSlug )
			);
		} );

		const onPlansToggleChanged = ( newBillingPeriod: Plans.PlanBillingPeriod ) => {
			if ( ! isUIDisabled ) {
				setBillingPeriod( newBillingPeriod );
			}
		};

		const updatePlanSelectionDisabledState = () => {
			const buttons = document.getElementsByClassName( 'plan-item__select-button' );
			for ( let i = 0; i < buttons.length; ++i ) {
				( buttons[ i ] as HTMLButtonElement ).disabled = isUIDisabled;
			}
		};

		const disableUI = () => {
			if ( ! isUIDisabled ) {
				setIsUIDisabled( true );
				updatePlanSelectionDisabledState();
			}
		};

		const updateSelectedPlanButton = ( slug: string ) => {
			if ( slug.length > 0 ) {
				const parentSpan = document.getElementById( 'plan-item-' + slug );
				if ( ! parentSpan ) {
					return;
				}

				const buttons = parentSpan.getElementsByClassName( 'plan-item__select-button' );
				if ( buttons.length <= 0 ) {
					return;
				}

				const button = buttons[ 0 ];
				if ( ! button.classList.contains( 'selected-plan-item' ) ) {
					button.classList.add( 'selected-plan-item' );
				}
			} else {
				const buttons = document.getElementsByClassName( 'selected-plan-item' );
				for ( let i = 0; i < buttons.length; ++i ) {
					buttons[ i ].classList.remove( 'selected-plan-item' );
				}
			}
		};

		const onPlanSelect = async ( planId: number | undefined, plan: Plans.Plan ) => {
			disableUI();
			updateSelectedPlanButton( plan.periodAgnosticSlug );

			setSelectedPlanProductId( planId );

			setPendingAction( async () => {
				setProgress( 0 );
				try {
					await createVideoPressSite( {
						username: currentUser ? currentUser?.username : '',
						languageSlug: locale,
						visibility,
					} );
				} catch ( e ) {
					return;
				}
				setProgress( 0.5 );

				const newSite = getNewSite();
				setSelectedSite( newSite?.blogid );
				setIntentOnSite( newSite?.site_slug as string, flow as string );
				saveSiteSettings( newSite?.blogid as number, {
					launchpad_screen: 'full',
					blogdescription: siteDescription,
				} );

				const planObject = supportedPlans.find(
					( plan ) => plan.productIds.indexOf( planId as number ) >= 0
				);

				const planProductObject = getPlanProduct( planObject?.periodAgnosticSlug, billingPeriod );

				const cartKey = await cartManagerClient.getCartKeyForSiteSlug(
					newSite?.site_slug as string
				);

				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const productsToAdd: any[] = [
					{
						product_slug: planProductObject?.storeSlug,
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

				setProgress( 0.75 );

				await cartManagerClient.forCartKey( cartKey ).actions.addProductsToCart( productsToAdd );

				setProgress( 1.0 );

				const redirectTo = encodeURIComponent(
					`/setup/videopress/launchpad?siteSlug=${ newSite?.site_slug }&siteId=${ newSite?.blogid }`
				);

				window.location.replace(
					`/checkout/${ newSite?.site_slug }?signup=1&redirect_to=${ redirectTo }`
				);
			} );

			submit?.();
		};

		const getVideoPressFeaturesList = ( plan: Plans.Plan ) => {
			/* translators: A label displaying the amount of storage space available in the plan, eg: "13GB" or "200GB" */
			const storageString = plan.storage ? sprintf( __( '%s storage space' ), plan.storage ) : null;
			const uploadVideosString = __( 'Upload videos' );

			const filterDuplicateFeatures = ( feature: PlanSimplifiedFeature ) =>
				! [ storageString, uploadVideosString ].includes( feature.name );

			return [
				null !== storageString && {
					name: storageString,
					requiresAnnuallyBilledPlan: false,
				},
				{ name: __( 'High-quality 4K video' ), requiresAnnuallyBilledPlan: false },
				{ name: __( 'Ad-free video playback' ), requiresAnnuallyBilledPlan: false },
				{ name: __( 'Video subtitles and chapters' ), requiresAnnuallyBilledPlan: false },
				{ name: __( 'Background videos' ), requiresAnnuallyBilledPlan: false },
				{ name: __( 'Private videos' ), requiresAnnuallyBilledPlan: false },
				{ name: __( 'Adaptive video streaming' ), requiresAnnuallyBilledPlan: false },
				...( plan.features.filter( filterDuplicateFeatures ) ?? [] ),
			].filter( isValueTruthy );
		};

		return (
			<div className="plans-grid">
				<PlansIntervalToggle
					intervalType={ billingPeriod }
					onChange={ onPlansToggleChanged }
					maxMonthlyDiscountPercentage={ maxAnnualDiscount }
					className="plans-grid__toggle"
				/>

				<div className="plans-grid__table">
					<div className="plans-grid__table-container">
						<div className="plans-table">
							{ filteredPlans
								.filter( ( plan ) => !! plan )
								.map( ( plan, index ) => (
									<span
										key={ 'plan-item-' + plan.periodAgnosticSlug }
										id={ 'plan-item-' + plan.periodAgnosticSlug }
									>
										<PlanItem
											popularBadgeVariation="ON_TOP"
											allPlansExpanded={ allPlansExpanded }
											key={ plan.periodAgnosticSlug }
											slug={ plan.periodAgnosticSlug }
											domain={ domain }
											CTAVariation="NORMAL"
											features={ getVideoPressFeaturesList( plan ) }
											billingPeriod={ billingPeriod }
											isPopular={ 'business' === plan.periodAgnosticSlug }
											isFree={ plan.isFree }
											name={ plan?.title.toString() }
											isSelected={
												!! selectedPlanProductId &&
												selectedPlanProductId ===
													getPlanProduct( plan.periodAgnosticSlug, billingPeriod )?.productId
											}
											onSelect={ ( id ) => onPlanSelect( id, plan ) }
											onPickDomainClick={ () => goToStep && goToStep( 'chooseADomain' ) }
											onToggleExpandAll={ () => setAllPlansExpanded( ( expand ) => ! expand ) }
											// translators: Placeholder refers to the name of a WordPress.com plan.
											CTAButtonLabel={ __( 'Get %s' ).replace( '%s', plan.title ) }
											popularBadgeText={ __( 'Best for Video' ) }
										/>
										{ index < filteredPlans.length - 1 && (
											<div key={ 'plan-item-separator-' + index } className="plan-separator"></div>
										) }
									</span>
								) ) }
						</div>
					</div>
				</div>
			</div>
		);
	};

	const getFormattedHeader = () => {
		if ( ! isVideoPressFlow ) {
			return undefined;
		}

		return (
			<FormattedHeader
				id="choose-a-plan-header"
				headerText={ __( 'Choose a plan' ) }
				subHeaderText={ __( 'Unlock a powerful bundle of features for your video site.' ) }
				align="center"
			/>
		);
	};

	const stepContent = isVideoPressFlow ? getVideoPressFlowStepContent() : getDefaultStepContent();

	return (
		<StepContainer
			stepName="chooseAPlan"
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
