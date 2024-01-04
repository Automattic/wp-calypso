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
import { useQuery } from '../hooks/use-query';
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
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE );
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
		const query = useQuery();
		const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		useLayoutEffect( () => {
			const queryParams = Object.fromEntries( query );

			const urlWithQueryParams = addQueryArgs( '/setup/new-hosted-site', queryParams );

			if ( ! userIsLoggedIn ) {
				window.location.assign(
					addQueryArgs( '/start/hosting', {
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
			},
			// We only need to reset the store and/or check the `campaign` param when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
