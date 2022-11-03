/* eslint-disable wpcalypso/jsx-classname-namespace */
import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { Plans } from 'calypso/../packages/data-stores/src';
import { SENSEI_FLOW, SenseiStepContainer } from 'calypso/../packages/onboarding/src';
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
import { SenseiStepError } from '../sensei-setup/sensei-step-error';
import { SenseiStepProgress } from '../sensei-setup/sensei-step-progress';
import { Tagline, Title, PlansIntervalToggle } from './components';
import type { Step } from '../../types';
import type { Props as PlanItemProps } from 'calypso/../packages/plans-grid/src/plans-table/plan-item';
import './styles.scss';

enum Status {
	Initial,
	Bundling,
	Error,
}

const SenseiPlan: Step = ( { flow, navigation: { goToStep } } ) => {
	const [ billingPeriod, setBillingPeriod ] = useState< Plans.PlanBillingPeriod >( 'ANNUALLY' );
	const [ status, setStatus ] = useState< Status >( Status.Initial );

	const { __ } = useI18n();
	const locale = useLocale();
	const visibility = useNewSiteVisibility();
	const currentUser = useSelect( ( select ) => select( USER_STORE ).getCurrentUser() );
	const { supportedPlans, maxAnnualDiscount } = useSupportedPlans( locale, billingPeriod );
	const { createSenseiSite, setSelectedSite } = useDispatch( ONBOARD_STORE );
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

	const goToDomainStep = useCallback( () => {
		if ( goToStep ) {
			goToStep( 'senseiDomain' );
		}
	}, [ goToStep ] );

	const onPlanSelect = async () => {
		try {
			setStatus( Status.Bundling );
			await createSenseiSite( {
				username: currentUser?.username || '',
				languageSlug: locale,
				visibility,
			} );

			const newSite = getNewSite();
			setSelectedSite( newSite?.blogid );
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
				`/setup/sensei/senseiLaunch?siteSlug=${ newSite?.site_slug }&siteId=${ newSite?.blogid }`
			);

			window.location.replace(
				`/checkout/${ newSite?.site_slug }?signup=1&redirect_to=${ redirectTo }`
			);
		} catch ( err ) {
			setStatus( Status.Error );
		}
	};

	let features: PlanItemProps[ 'features' ] = [];
	planObject?.features
		.filter( ( { requiresAnnuallyBilledPlan } ) => requiresAnnuallyBilledPlan )
		.forEach( ( plan ) => features.push( plan ) );
	features = [
		...features,
		{
			name: __( 'Unlimited courses' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Unlimited students' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Unlimited quizzes' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Interactive Videos and Content' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( 'Low transaction fees' ),
			requiresAnnuallyBilledPlan: false,
		},
		{
			name: __( '10 hours of video hosting or 200 GB storage' ),
			requiresAnnuallyBilledPlan: false,
		},
	];

	return (
		<SenseiStepContainer stepName="senseiPlan" recordTracksEvent={ recordTracksEvent }>
			{ status === Status.Initial && (
				<>
					<Title>{ __( 'Choose Monthly or Annually' ) }</Title>

					<Tagline>
						{ __( 'Sensei + WooCommerce + Jetpack + WordPress.com in the ultimate Course Bundle' ) }
					</Tagline>

					<PlansIntervalToggle
						intervalType={ billingPeriod }
						onChange={ handlePlanBillingPeriodChange }
						maxMonthlyDiscountPercentage={ maxAnnualDiscount }
					/>

					<PlanItem
						allPlansExpanded
						slug="business"
						domain={ domain }
						CTAVariation="NORMAL"
						features={ features }
						billingPeriod={ billingPeriod }
						name={ __( 'Sensei Pro Bundle' ) }
						onSelect={ onPlanSelect }
						onPickDomainClick={ goToDomainStep }
						CTAButtonLabel={ __( 'Get Sensei Pro Bundle' ) }
					/>
				</>
			) }
			{ status === Status.Bundling && (
				<SenseiStepProgress>{ __( 'Preparing Your Bundle' ) }</SenseiStepProgress>
			) }
			{ status === Status.Error && <SenseiStepError /> }
		</SenseiStepContainer>
	);
};

export default SenseiPlan;
