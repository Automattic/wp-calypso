import { TIMELESS_PLAN_BUSINESS, TIMELESS_PLAN_PREMIUM } from '@automattic/data-stores/src/plans';
import { VIDEOPRESS_TV_PURCHASE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteSlug } from '../hooks/use-site-slug';
import { PLANS_STORE, SITE_STORE, USER_STORE, ONBOARD_STORE } from '../stores';
import './internals/videopress.scss';
import ProcessingStep from './internals/steps-repository/processing-step';
import VideoPressTvRedirectStep from './internals/steps-repository/videopress-tv-redirect';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect, SiteSelect, PlansSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const videopressTvPurchase: Flow = {
	name: VIDEOPRESS_TV_PURCHASE_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	isSignupFlow: false,
	useSteps() {
		return [
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'redirect', component: VideoPressTvRedirectStep },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress tv stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-tv-purchase-stepper' ) ) {
				document.body.classList.add( 'is-videopress-tv-purchase-stepper' );
			}
		}

		const name = this.name;
		const locale = useFlowLocale();
		const { setPendingAction, setProgress, setSelectedSite } = useDispatch( ONBOARD_STORE );
		const { setIntentOnSite } = useDispatch( SITE_STORE );
		const { supportedPlans } = useSupportedPlans( locale, 'MONTHLY' );
		const _siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const userData = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(),
			[]
		);
		const siteData = useSelect(
			( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( _siteSlug || '' ),
			[]
		) || {
			plan: null,
			site_owner: null,
			ID: null,
		};
		const getPlanProduct = useSelect(
			( select ) => ( select( PLANS_STORE ) as PlansSelect ).getPlanProduct,
			[]
		);

		const [ isVideoPressTvPurchasePending, setIsVideoPressTvPurchasePending ] = useState( false );

		const addVideoPressPendingAction = () => {
			// if the supported plans haven't been received yet, wait for next rerender to try again.
			if ( 0 === supportedPlans.length ) {
				return;
			}

			// If the site is already on a plan, we don't need to add a pending action. Maybe redirect to site?
			const siteFreePlan = siteData?.plan?.is_free;
			if ( ! siteFreePlan ) {
				return;
			}

			// If the user is not logged in, we don't need to add a pending action.
			if ( ! userIsLoggedIn ) {
				return;
			}

			// If the user is logged in, and the site does not belong to them, we don't need to add a pending action.
			if ( userData?.ID !== siteData?.site_owner ) {
				return;
			}

			// only allow one call to this action to occur
			if ( isVideoPressTvPurchasePending ) {
				return;
			}

			setIsVideoPressTvPurchasePending( true );

			// If the user is logged in, and the site belongs to them, and they are not on a plan, we need to add a pending action.
			setPendingAction( async () => {
				setProgress( 0 );
				setSelectedSite( siteData?.ID || 0 );
				setIntentOnSite( _siteSlug || '', VIDEOPRESS_TV_PURCHASE_FLOW );

				// select the premium plan for now. This will be replaced with our video plan.
				let planObject = supportedPlans.find(
					( plan ) => TIMELESS_PLAN_PREMIUM === plan.periodAgnosticSlug
				);
				if ( ! planObject ) {
					planObject = supportedPlans.find(
						( plan ) => TIMELESS_PLAN_BUSINESS === plan.periodAgnosticSlug
					);
				}

				const cartKey = _siteSlug
					? await cartManagerClient.getCartKeyForSiteSlug( _siteSlug )
					: null;
				if ( ! cartKey ) {
					return;
				}
				setProgress( 0.5 );

				const planProductObject = getPlanProduct( planObject?.periodAgnosticSlug, 'MONTHLY' );
				const productsToAdd: MinimalRequestCartProduct[] = planProductObject
					? [
							{
								product_slug: planProductObject.storeSlug,
								extra: {
									signup_flow: VIDEOPRESS_TV_PURCHASE_FLOW,
								},
							},
					  ]
					: [];

				// Add plan to cart.
				setProgress( 0.75 );
				cartManagerClient
					.forCartKey( cartKey )
					.actions.addProductsToCart( productsToAdd )
					.then( () => {
						setProgress( 1.0 );
						const redirectTo = encodeURIComponent(
							`/setup/${ name }/redirect?siteSlug=${ _siteSlug }`
						);
						persistSignupDestination( redirectTo );
						setSignupCompleteSlug( _siteSlug || '' );
						setSignupCompleteFlowName( VIDEOPRESS_TV_PURCHASE_FLOW );

						window.location.replace(
							`/checkout/${ _siteSlug }?signup=1&redirect_to=${ redirectTo }`
						);
					} );
			} );
		};

		// needs to be wrapped in a useEffect because validation can call `navigate` which needs to be called in a useEffect
		useEffect( () => {
			switch ( _currentStep ) {
				case 'processing':
					if ( ! userIsLoggedIn ) {
						const redirectTo = encodeURIComponent(
							`/setup/videopress-tv-purchase?siteSlug=${ _siteSlug }`
						);
						window.location.replace(
							`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=VideoPress.TV&redirect_to=${ redirectTo }`
						);
						return;
					}
					addVideoPressPendingAction();
					break;
				case 'redirect':
					window.location.href = `https://${ _siteSlug }`;
				default:
					break;
			}
		} );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'redirect':
					window.location.href = `https://${ _siteSlug }`;
				default:
					return navigate( 'processing' );
			}
		};

		const goToStep = ( step: string ) => {
			const siteBelongsToUser = siteData && userData && siteData.site_owner === userData.ID;
			if ( 'redirect' === step && siteBelongsToUser ) {
				window.location.href = `https://${ _siteSlug }`;
			}

			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default videopressTvPurchase;
