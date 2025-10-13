import { WOO_HOSTED_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { persistSignupDestination } from 'calypso/signup/storageUtils';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';

async function initialize() {
	const { resetOnboardStore } = dispatch( ONBOARD_STORE ) as OnboardActions;

	await resetOnboardStore();

	const steps = [ STEPS.UNIFIED_DOMAINS, STEPS.UNIFIED_PLANS, STEPS.PROCESSING ];

	return stepsWithRequiredLogin( steps );
}

const wooHosted: FlowV2< typeof initialize > = {
	name: WOO_HOSTED_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: false,
	initialize,
	useStepsProps() {
		return {
			plans: {
				displayedIntervals: [ 'monthly', 'yearly' ],
			},
		} as any;
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			resetCouponCode,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);

		const query = useQuery();

		const wooHostedSiteSlug = query.get( 'site' );
		const showDomainStep = query.has( 'showDomainStep' );

		const getGoBack = () => {
			if ( _currentStepSlug === STEPS.UNIFIED_PLANS.slug && showDomainStep ) {
				return () => navigate( STEPS.UNIFIED_PLANS.slug );
			}
		};

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.UNIFIED_DOMAINS.slug: {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						throw new Error( 'Navigation to use my domain is not supported for this flow' );
					}

					setSiteUrl( wooHostedSiteSlug as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}

				case STEPS.UNIFIED_PLANS.slug: {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...extraProducts ] = cartItems ?? [];

					if ( ! pickedPlan ) {
						throw new Error( 'No product slug found' );
					}

					setPlanCartItem( {
						...pickedPlan,
						extra: {
							...pickedPlan.extra,
						},
					} );

					setProductCartItems( extraProducts.filter( ( product ) => product !== null ) );
					return navigate( STEPS.PROCESSING.slug );
				}

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						const destination = `https://${ wooHostedSiteSlug }/wp-admin/admin.php?page=wc-admin`;

						if ( providedDependencies.goToCheckout ) {
							persistSignupDestination( destination );

							couponCode && resetCouponCode();
							return window.location.assign(
								addQueryArgs(
									`/checkout/${ encodeURIComponent(
										( providedDependencies?.siteSlug as string ) ?? ''
									) }`,
									{ redirect_to: destination, coupon: couponCode }
								)
							);
						}

						return navigate( STEPS.UNIFIED_PLANS.slug );
					}
				}
			}
		};

		return {
			goBack: getGoBack(),
			submit,
		};
	},
};

export default wooHosted;
