import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const newsletter: Flow = {
	name: NEWSLETTER_FLOW,
	get title() {
		return translate( 'Newsletter' );
	},
	useSteps() {
		const query = useQuery();
		const ref = query.get( 'ref' ) || '';

		let steps = [
			{
				slug: 'newsletterSetup',
				asyncComponent: () => import( './internals/steps-repository/newsletter-setup' ),
			},
			{ slug: 'domains', asyncComponent: () => import( './internals/steps-repository/domains' ) },
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'subscribers',
				asyncComponent: () => import( './internals/steps-repository/subscribers' ),
			},
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'launchpad',
				asyncComponent: () => import( './internals/steps-repository/launchpad' ),
			},
		];
		if ( ref !== 'newsletter-lp' ) {
			steps = [
				{ slug: 'intro', asyncComponent: () => import( './internals/steps-repository/intro' ) },
				...steps,
			];
		}
		return steps;
	},
	useSideEffect() {
		const { setHidePlansFeatureComparison } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			setHidePlansFeatureComparison( true );
		}, [] );
	},
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const siteSlug = useSiteSlug();
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const query = useQuery();
		const ref = query.get( 'ref' ) || '';
		const initialStep = ref === 'newsletter-lp' ? 'newsletterSetup' : 'intro';

		const flowProgress = useFlowProgress( {
			stepName: _currentStep,
			flowName,
		} );
		setStepProgress( flowProgress );
		const locale = useLocale();
		const getStartUrl = () => {
			return locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Newsletter&redirect_to=/setup/${ flowName }/newsletterSetup`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Newsletter&redirect_to=/setup/${ flowName }/newsletterSetup`;
		};

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStep,
			}
		);

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );
			const logInUrl = getStartUrl();

			if ( ! userIsLoggedIn ) {
				clearSignupDestinationCookie();
				return window.location.assign( logInUrl );
			}

			switch ( _currentStep ) {
				case 'intro':
					return navigate( 'newsletterSetup' );

				case 'newsletterSetup':
					return navigate( 'domains' );

				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ providedDependencies?.siteSlug }`, {
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
							`/setup/${ flowName }/subscribers?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}
					// If the user chooses a free plan, we need to redirect to the subscribers and not checkout.
					return window.location.assign(
						`/setup/${ flowName }/subscribers?siteSlug=${ providedDependencies?.siteSlug }`
					);

				case 'subscribers':
					return navigate( 'launchpad' );
			}
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );
				default:
					return navigate( initialStep );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default newsletter;
