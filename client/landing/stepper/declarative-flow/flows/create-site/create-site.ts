import { isDotComPlan, getPlanByPathSlug } from '@automattic/calypso-products';
import { CREATE_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	getSignupCompleteSiteID,
	setSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { ONBOARD_STORE } from '../../../stores';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import type { FlowV2, ProvidedDependencies, StepperStep } from '../../internals/types';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';

const createSite: FlowV2 = {
	name: CREATE_SITE_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	async initialize() {
		const { resetOnboardStore, setPlanCartItem } = dispatch( ONBOARD_STORE ) as OnboardActions;

		await resetOnboardStore();

		const queryParams = getCurrentQueryParams();
		const planPathSlug = queryParams.get( 'plan' );

		const steps: StepperStep[] = [ STEPS.UNIFIED_DOMAINS ];

		if ( planPathSlug !== 'free' ) {
			const plan = getPlanByPathSlug( planPathSlug ?? '' );

			if ( ! plan || ! isDotComPlan( { productSlug: plan.getStoreSlug() } ) ) {
				steps.push( STEPS.UNIFIED_PLANS );
			} else {
				await setPlanCartItem( {
					product_slug: plan.getStoreSlug(),
				} );
			}
		}

		steps.push( STEPS.SITE_CREATION_STEP, STEPS.PROCESSING );

		return stepsWithRequiredLogin( steps );
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setSiteUrl,
			setSignupDomainOrigin,
			resetCouponCode,
		} = useDispatch( ONBOARD_STORE );
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);

		const getGoBack = () => {
			if ( _currentStepSlug === STEPS.UNIFIED_PLANS.slug ) {
				return () => navigate( STEPS.UNIFIED_DOMAINS.slug );
			}
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			if ( providedDependencies.siteId ) {
				setSignupCompleteSiteID( providedDependencies.siteId );
			}

			switch ( _currentStepSlug ) {
				case STEPS.UNIFIED_DOMAINS.slug: {
					setSiteUrl( providedDependencies.siteUrl );
					setDomain( providedDependencies.suggestion );
					setDomainCartItem( providedDependencies.domainItem );
					setDomainCartItems( providedDependencies.domainCart );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin );

					if ( planCartItem ) {
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.UNIFIED_PLANS.slug: {
					const cartItems = providedDependencies.cartItems as Array< typeof planCartItem >;
					const productSlug = cartItems?.[ 0 ]?.product_slug;

					if ( ! productSlug ) {
						throw new Error( 'No product slug found' );
					}

					setPlanCartItem( {
						product_slug: productSlug,
					} );

					setSignupCompleteFlowName( this.name );
					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug );

				case STEPS.PROCESSING.slug: {
					const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
					const destinationParams: Record< string, string > = {
						siteId,
					};

					const destination = addQueryArgs( '/setup/site-setup', destinationParams );

					if ( providedDependencies.goToCheckout ) {
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( this.name );

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
		};

		return {
			goBack: getGoBack(),
			submit,
		};
	},
};

export default createSite;
