import { type UserSelect } from '@automattic/data-stores';
import { LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import type { Flow, ProvidedDependencies } from './internals/types';

const linkInBio: Flow = {
	name: LINK_IN_BIO_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	isSignupFlow: true,
	useSteps() {
		const publicSteps = [
			{ slug: 'intro', asyncComponent: () => import( './internals/steps-repository/intro' ) },
		];

		const privateSteps = stepsWithRequiredLogin( [
			{
				slug: 'linkInBioSetup',
				asyncComponent: () => import( './internals/steps-repository/link-in-bio-setup' ),
			},
			{ slug: 'domains', asyncComponent: () => import( './internals/steps-repository/domains' ) },
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'patterns',
				asyncComponent: () => import( './internals/steps-repository/design-carousel' ),
			},
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'launchpad',
				asyncComponent: () => import( './internals/steps-repository/launchpad' ),
			},
		] );

		return [ ...publicSteps, ...privateSteps ];
	},

	useSideEffect() {
		const { setHidePlansFeatureComparison } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			setHidePlansFeatureComparison( true );
		} );
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		triggerGuidesForStep( flowName, _currentStepSlug );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return navigate( 'domains' );

				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'createSite' );

				case 'createSite':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );
						const returnUrl = encodeURIComponent(
							`/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}

					return navigate( `launchpad?siteSlug=${ providedDependencies?.siteSlug }` );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = async () => {
			switch ( _currentStepSlug ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'link-in-bio',
						siteId,
						siteSlug,
					} );
					return;

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default linkInBio;
