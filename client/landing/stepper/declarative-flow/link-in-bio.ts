import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { USER_STORE } from 'calypso/landing/stepper/stores';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const linkInBio: Flow = {
	name: 'link-in-bio',
	title: 'Link in Bio',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [
			'intro',
			'linkInBioSetup',
			'patterns',
			'completingPurchase',
			'processing',
			...( isEnabled( 'signup/launchpad' ) ? [ 'launchpad' ] : [] ),
		] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const siteSlug = useSiteSlug();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'patterns' );
					}
					return window.location.replace(
						'/start/account?redirect_to=/setup/patterns?flow=link-in-bio'
					);

				case 'patterns':
					return navigate( 'linkInBioSetup' );

				case 'linkInBioSetup':
					return window.location.replace(
						`/start/newsletter/domains?new=${ encodeURIComponent(
							providedDependencies.siteTitle as string
						) }&search=yes&hide_initial_query=yes`
					);

				case 'completingPurchase':
					return navigate( 'processing' );

				case 'processing': {
					return navigate( providedDependencies?.destination as StepPath );
				}
			}
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.replace( `/view/${ siteSlug }` );

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
