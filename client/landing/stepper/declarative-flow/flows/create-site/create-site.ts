import { recordTracksEvent } from '@automattic/calypso-analytics';
import { isDotComPlan, getPlanByPathSlug, PRODUCT_1GB_SPACE } from '@automattic/calypso-products';
import {
	AddOns,
	type OnboardActions,
	type OnboardSelect,
	type StorageAddOnSlug,
} from '@automattic/data-stores';
import { STORAGE_ADD_ONS } from '@automattic/data-stores/src/add-ons';
import { getAddOn } from '@automattic/data-stores/src/add-ons/add-ons-list';
import { CREATE_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { pathToUrl } from 'calypso/lib/url';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	getSignupCompleteSiteID,
	setSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import type { FlowV2, ProvidedDependencies, StepperStep } from '../../internals/types';

const createSite: FlowV2 = {
	name: CREATE_SITE_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	async initialize() {
		const steps: StepperStep[] = [ STEPS.UNIFIED_DOMAINS ];

		const { resetOnboardStore, setPlanCartItem, setProductCartItems } = dispatch(
			ONBOARD_STORE
		) as OnboardActions;

		await resetOnboardStore();

		const queryParams = getCurrentQueryParams();

		const planPathSlug = queryParams.get( 'plan' );

		if ( planPathSlug !== 'free' ) {
			const plan = getPlanByPathSlug( planPathSlug ?? '' );

			if ( ! plan || ! isDotComPlan( { productSlug: plan.getStoreSlug() } ) ) {
				steps.push( STEPS.UNIFIED_PLANS );
			} else {
				setPlanCartItem( {
					product_slug: plan.getStoreSlug(),
				} );
			}
		}

		const storageAddon = queryParams.get( 'storage' );
		const selectedAddOn = getAddOn( storageAddon as StorageAddOnSlug );

		if (
			selectedAddOn &&
			STORAGE_ADD_ONS.includes( selectedAddOn.addOnSlug as StorageAddOnSlug )
		) {
			setProductCartItems( [
				{
					product_slug: PRODUCT_1GB_SPACE,
					quantity: selectedAddOn.quantity,
					volume: 1,
					extra: { feature_slug: AddOns.ADD_ON_50GB_STORAGE },
				},
			] );
			recordTracksEvent( 'calypso_signup_storage_add_on_selected', {
				add_on_slug: selectedAddOn.addOnSlug,
			} );
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
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			resetCouponCode,
		} = useDispatch( ONBOARD_STORE );
		const query = useQuery();

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

					if ( planCartItem || query.get( 'plan' ) === 'free' ) {
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.UNIFIED_PLANS.slug: {
					const [ productSlug, ...addOns ] = providedDependencies.cartItems as Array<
						typeof planCartItem
					>;

					setPlanCartItem( {
						product_slug: productSlug,
					} );

					setProductCartItems( addOns );
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
								{
									redirect_to: destination,
									coupon: couponCode,
									checkoutBackUrl: pathToUrl(
										addQueryArgs( `/overview/${ providedDependencies.siteSlug }`, {
											ref: this.name,
										} )
									),
								}
							)
						);
					}

					window.location.replace( destination );
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
