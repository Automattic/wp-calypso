import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import DomainsStep from './internals/steps-repository/domains';
import Intro from './internals/steps-repository/intro';
import LaunchPad from './internals/steps-repository/launchpad';
import LinkInBioSetup from './internals/steps-repository/link-in-bio-setup';
import PatternsStep from './internals/steps-repository/patterns';
import PlansStep from './internals/steps-repository/plans';
import Processing from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import type { Flow, ProvidedDependencies } from './internals/types';

const linkInBio: Flow = {
	name: LINK_IN_BIO_FLOW,
	get title() {
		return translate( 'Link in Bio' );
	},
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_link_in_bio', { flow: this.name } );
		}, [] );

		return [
			{ slug: 'intro', component: Intro },
			{ slug: 'linkInBioSetup', component: LinkInBioSetup },
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'plans', component: PlansStep },
			{ slug: 'patterns', component: PatternsStep },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'processing', component: Processing },
			{ slug: 'launchpad', component: LaunchPad },
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();
		const queryParams = useQuery();
		const tld = queryParams.get( 'tld' );
		const selectedDomain = queryParams.get( 'selectedDomain' );

		// At the moment, the TLD variation relies on going back and forth from the classic signup framework
		// and the Stepper framework. Since it begins from the former, the Stepper framework doesn't have a chance
		// to inject the step progress there, which can be quite confusing. Thus, we've decided to just not show it at all.
		// Once the whole flow is moved into Stepper, this can also be removed. See Automattic/martech#1256
		if ( ! tld ) {
			setStepProgress( flowProgress );
		}

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStepSlug,
			}
		);

		// for the standard Link in Bio flow
		const submitDefault = ( providedDependencies: ProvidedDependencies = {} ) => {
			const logInUrl =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/${ flowName }/patterns`
					: `/start/account/user?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/${ flowName }/patterns`;

			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return navigate( 'domains' );

				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
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

		// when there is a designated tld, the domain step will come first, hence altering the flow accordingly
		const submitDomainFirst = ( providedDependencies: ProvidedDependencies = {} ) => {
			const logInUrl =
				locale && locale !== 'en'
					? `/start/link-in-bio-tld/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&tld=${ tld }`
					: `/start/link-in-bio-tld?variationName=${ flowName }&pageTitle=Link%20in%20Bio&tld=${ tld }`;

			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return window.location.assign(
							`/start/link-in-bio-tld/domains?new=${ encodeURIComponent(
								providedDependencies.siteTitle as string
							) }&search=yes&hide_initial_query=yes`
						);
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return window.location.assign(
						`/start/link-in-bio-tld/plans-link-in-bio?variationName=${ flowName }&pageTitle=Link%20in%20Bio&tld=${ tld }&selectedDomain=${ selectedDomain }`
					);

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const submit = tld ? submitDomainFirst : submitDefault;

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStepSlug ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

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
