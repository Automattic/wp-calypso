import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useQuery } from '../hooks/use-query';
import { ONBOARD_STORE } from '../stores';
import { startedInHostingFlow } from '../utils/hosting-flow';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import './internals/new-hosted-site-flow.scss';

const otherSteps = [
	{
		slug: 'siteCreationStep',
		asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
	},
	{
		slug: 'processing',
		asyncComponent: () => import( './internals/steps-repository/processing-step' ),
	},
];

const hosting: Flow = {
	name: NEW_HOSTED_SITE_FLOW,
	useSteps() {
		const hostingFlow = useQuery().get( 'hosting-flow' ) === 'true';

		if ( hostingFlow ) {
			return [
				{
					slug: 'options',
					asyncComponent: () => import( './internals/steps-repository/site-options' ),
				},
				{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
				...otherSteps,
			];
		}

		return [
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'options',
				asyncComponent: () => import( './internals/steps-repository/site-options' ),
			},
			...otherSteps,
		];
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const hostingFlow = useSelector( startedInHostingFlow );
		const { setSiteTitle, setPlanCartItem, setSiteGeoAffinity } = useDispatch( ONBOARD_STORE );
		const { siteGeoAffinity, planCartItem } = useSelect(
			( select ) => ( {
				siteGeoAffinity: ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSiteGeoAffinity(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			} ),
			[]
		);

		const flowName = this.name;

		const handleStepSubmission = ( providedDependencies: ProvidedDependencies = {} ) => {
			if ( _currentStepSlug === 'siteCreationStep' ) {
				return navigate( 'processing' );
			}

			if ( _currentStepSlug === 'processing' ) {
				// Purchasing these plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
				const goingAtomic =
					providedDependencies.goToCheckout &&
					planCartItem?.product_slug &&
					[
						'business-bundle',
						'business-bundle-monthly',
						'ecommerce-bundle',
						'ecommerce-bundle-monthly',
					].includes( planCartItem.product_slug );

				const destination = goingAtomic
					? addQueryArgs( '/setup/transferring-hosted-site', {
							siteId: providedDependencies.siteId,
					  } )
					: '/home/' + providedDependencies.siteSlug;

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

			return providedDependencies;
		};

		if ( hostingFlow ) {
			const goBack = () => {
				if ( _currentStepSlug === 'options' ) {
					return window.location.assign( '/sites?hosting-flow=true' );
				}

				if ( _currentStepSlug === 'plans' ) {
					navigate( 'options' );
				}
			};

			const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
				recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

				switch ( _currentStepSlug ) {
					case 'options': {
						setSiteTitle( providedDependencies.siteTitle );
						setSiteGeoAffinity( providedDependencies.siteGeoAffinity );

						setPlanCartItem( {
							product_slug: planCartItem?.product_slug,
							extra: { geo_affinity: providedDependencies.siteGeoAffinity },
						} );

						return navigate( 'plans' );
					}

					case 'plans': {
						const productSlug = ( providedDependencies.plan as MinimalRequestCartProduct )
							.product_slug;

						setPlanCartItem( {
							product_slug: productSlug,
							extra: { geo_affinity: siteGeoAffinity },
						} );

						return navigate( 'siteCreationStep' );
					}

					default:
						return handleStepSubmission( providedDependencies );
				}
			};

			return {
				goBack,
				submit,
			};
		}

		const goBack = () => {
			if ( _currentStepSlug === 'plans' ) {
				return window.location.assign( '/sites' );
			}

			if ( _currentStepSlug === 'options' ) {
				navigate( 'plans' );
			}
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'plans': {
					const productSlug =
						( providedDependencies?.plan as MinimalRequestCartProduct | null )?.product_slug ?? '';

					// User picked the Free plan
					if ( ! productSlug ) {
						return navigate( 'options' );
					}

					setPlanCartItem( {
						product_slug: productSlug,
					} );

					return navigate( 'options' );
				}

				case 'options': {
					setSiteTitle( providedDependencies.siteTitle );

					if ( providedDependencies.siteGeoAffinity ) {
						setPlanCartItem( {
							product_slug: planCartItem?.product_slug,
							extra: { geo_affinity: providedDependencies.siteGeoAffinity },
						} );

						setSiteGeoAffinity( providedDependencies.siteGeoAffinity );
					}

					return navigate( 'siteCreationStep' );
				}

				default:
					return handleStepSubmission( providedDependencies );
			}
		};

		return { goBack, submit };
	},
	useSideEffect( currentStepSlug ) {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

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
