import { useLocale } from '@automattic/i18n-utils';
import { VIDEOPRESS_TV_PURCHASE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import { useSupportedPlans } from 'calypso/../packages/plans-grid/src/hooks';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { useSiteSlug } from '../hooks/use-site-slug';
import { PLANS_STORE, SITE_STORE, USER_STORE, ONBOARD_STORE } from '../stores';
import './internals/videopress.scss';
import ProcessingStep from './internals/steps-repository/processing-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect, SiteSelect, PlansSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const videopressTvPurchase: Flow = {
	name: VIDEOPRESS_TV_PURCHASE_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	useSteps() {
		return [ { slug: 'processing', component: ProcessingStep } ];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress tv stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-tv-purchase-stepper' ) ) {
				document.body.classList.add( 'is-videopress-tv-purchase-stepper' );
			}
		}

		const name = this.name;
		const locale = useLocale();
		const { setPendingAction, setProgress, setSelectedSite } = useDispatch( ONBOARD_STORE );
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
			( select ) => ( select( SITE_STORE ) as SiteSelect ).getSite( _siteSlug ),
			[]
		);
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

			setSelectedSite( siteData?.ID );
			// If the user is logged in, and the site belongs to them, and they are not on a plan, we need to add a pending action.
			setPendingAction( async () => {
				setProgress( 0 );

				// select the premium plan for now. This will be replaced with our video plan.
				let planObject = supportedPlans.find( ( plan ) => 'premium' === plan.periodAgnosticSlug );
				if ( ! planObject ) {
					planObject = supportedPlans.find( ( plan ) => 'business' === plan.periodAgnosticSlug );
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
						const redirectTo = encodeURIComponent( `${ _siteSlug }&message=purchase-complete` );

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
						window.location.replace(
							`/start/videopress-account/user/${ locale }?variationName=${ name }&flow=${ name }&pageTitle=VideoPress.TV&redirect_to=/setup/videopress-tv-purchase/processing`
						);
						return;
					}
					addVideoPressPendingAction();
					break;
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
				default:
					return navigate( 'processing' );
			}
		};

		const goToStep = ( step: string ) => {
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default videopressTvPurchase;
