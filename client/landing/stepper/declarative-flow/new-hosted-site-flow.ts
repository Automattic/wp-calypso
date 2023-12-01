import { isFreeHostingTrial } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useLayoutEffect } from 'react';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './internals/new-hosted-site-flow.scss';

const hosting: Flow = {
	name: NEW_HOSTED_SITE_FLOW,
	useSteps() {
		return [
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'trialAcknowledge',
				asyncComponent: () => import( './internals/steps-repository/trial-acknowledge' ),
			},
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const { setStepProgress, setPlanCartItem } = useDispatch( ONBOARD_STORE );

		const flowProgress = useSiteSetupFlowProgress( _currentStepSlug, 'host' );

		if ( flowProgress ) {
			setStepProgress( flowProgress );
		}

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
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

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

					return navigate( 'siteCreationStep' );
				}

				case 'trialAcknowledge': {
					return navigate( 'siteCreationStep' );
				}

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					// Purchasing Business or Commerce plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
					const destination = addQueryArgs( '/setup/transferring-hosted-site', {
						siteId: providedDependencies.siteId,
					} );

					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );

					if ( providedDependencies.goToCheckout ) {
						return window.location.assign(
							addQueryArgs(
								`/checkout/${ encodeURIComponent(
									( providedDependencies?.siteSlug as string ) ?? ''
								) }`,
								{ redirect_to: destination }
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
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		useLayoutEffect( () => {
			if ( ! userIsLoggedIn ) {
				window.location.assign( '/start/hosting' );
			}

			if ( currentStepSlug === 'trialAcknowledge' && ! isEligible ) {
				window.location.assign( '/setup/new-hosted-site' );
			}
		}, [ userIsLoggedIn, isEligible, currentStepSlug ] );

		useEffect(
			() => {
				if ( currentStepSlug === undefined ) {
					resetOnboardStore();
				}
			},
			// We only need to reset the store when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
