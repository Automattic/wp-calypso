import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, LINK_IN_BIO_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import wpcom from 'calypso/lib/wp';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const linkInBio: Flow = {
	name: LINK_IN_BIO_FLOW,
	title: 'Link in Bio',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_link_in_bio', { flow: this.name } );
		}, [] );

		return [ 'intro', 'linkInBioSetup', 'patterns', 'processing', 'launchpad' ] as StepPath[];
	},

	useSubmit( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();

		const queryParams = useQuery();
		const tld = queryParams.get( 'tld' );
		const newDomainSearch = queryParams.get( 'new' ); // be consistent with how the Domain step works

		// for the standard Link in Bio flow
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const logInUrl =
				locale && locale !== 'en'
					? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/patterns?flow=${ flowName }`
					: `/start/account/user?variationName=${ flowName }&pageTitle=Link%20in%20Bio&redirect_to=/setup/patterns?flow=${ flowName }`;

			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.assign( logInUrl );

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return window.location.assign(
						`/start/${ flowName }/domains?new=${ encodeURIComponent(
							providedDependencies.siteTitle as string
						) }&search=yes&hide_initial_query=yes`
					);

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

		// when there is a designated tld, the domain step will come first, hence altering the flow accordingly
		function submitDomainFirst( providedDependencies: ProvidedDependencies = {} ) {
			const logInUrl =
				locale && locale !== 'en'
					? `/start/link-in-bio-tld/${ locale }?variationName=${ flowName }&pageTitle=Link%20in%20Bio&tld=${ tld }&new=${ newDomainSearch }`
					: `/start/link-in-bio-tld?variationName=${ flowName }&pageTitle=Link%20in%20Bio&tld=${ tld }&new=${ newDomainSearch }`;

			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
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
						`/start/link-in-bio-tld/plans-link-in-bio?variationName=${ flowName }&pageTitle=Link%20in%20Bio&tld=${ tld }&new=${ newDomainSearch }`
					);

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		}

		if ( tld ) {
			return submitDomainFirst;
		}

		return submit;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		const siteSlug = useSiteSlug();

		setStepProgress( flowProgress );

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

		const submit = this.useSubmit( _currentStep, navigate );

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
