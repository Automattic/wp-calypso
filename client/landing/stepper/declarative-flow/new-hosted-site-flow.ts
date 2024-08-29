import { isFreeHostingTrial } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useLayoutEffect } from 'react';
import { recordFreeHostingTrialStarted } from 'calypso/lib/analytics/ad-tracking/ad-track-trial-start';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useDispatch as reduxUseDispatch, useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useQuery } from '../hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, UserSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './internals/new-hosted-site-flow.scss';

const hosting: Flow = {
	name: NEW_HOSTED_SITE_FLOW,
	isSignupFlow: true,
	useSteps() {
		return [
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'trialAcknowledge',
				asyncComponent: () => import( './internals/steps-repository/trial-acknowledge' ),
			},
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const { setPlanCartItem, resetCouponCode } = useDispatch( ONBOARD_STORE );
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);
		const flowName = this.name;

		const goBack = () => {
			if ( _currentStepSlug === 'plans' ) {
				return window.location.assign( '/sites?hosting-flow=true' );
			}
			if ( _currentStepSlug === 'trialAcknowledge' ) {
				navigate( 'plans' );
			}
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'plans': {
					const productSlug = ( providedDependencies.plan as MinimalRequestCartProduct )
						.product_slug;

					setPlanCartItem( {
						product_slug: productSlug,
					} );

					if ( isFreeHostingTrial( productSlug ) ) {
						return navigate( 'trialAcknowledge' );
					}

					return navigate( 'createSite' );
				}

				case 'trialAcknowledge': {
					return navigate( 'createSite' );
				}

				case 'createSite':
					return navigate( 'processing' );

				case 'processing': {
					// Purchasing Business or Commerce plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
					const destination = addQueryArgs( '/setup/transferring-hosted-site', {
						siteId: providedDependencies.siteId,
					} );

					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );

					// If the product is a free trial, record the trial start event for ad tracking.
					if ( planCartItem && isFreeHostingTrial( planCartItem?.product_slug ) ) {
						recordFreeHostingTrialStarted( flowName );
					}

					if ( providedDependencies.goToCheckout ) {
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

					return window.location.assign( destination );
				}
			}
		};

		return {
			goBack,
			submit,
		};
	},
	useSideEffect( currentStepSlug ) {
		const flowName = this.name;
		const dispatch = reduxUseDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const query = useQuery();
		const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }`,
		} );

		useLayoutEffect( () => {
			const queryParams = Object.fromEntries( query );

			const urlWithQueryParams = addQueryArgs( '/setup/new-hosted-site', queryParams );

			if ( ! userIsLoggedIn ) {
				window.location.assign(
					addQueryArgs( logInUrl, {
						...queryParams,
						flow: 'new-hosted-site',
					} )
				);
			}

			if ( currentStepSlug === 'trialAcknowledge' && ! isEligible ) {
				window.location.assign( urlWithQueryParams );
			}
		}, [ userIsLoggedIn, isEligible, currentStepSlug, query ] );

		useEffect(
			() => {
				if ( currentStepSlug === undefined ) {
					resetOnboardStore();
				}
				dispatch( setSelectedSiteId( null ) );
			},
			// We only need to reset the store and/or check the `campaign` param when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
