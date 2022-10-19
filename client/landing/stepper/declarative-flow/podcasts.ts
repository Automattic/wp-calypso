import { useEffect } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useSiteSlug } from '../hooks/use-site-slug';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

export const podcasts: Flow = {
	name: 'podcasts',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		}, [] );

		return [ 'letsGetStarted', 'chooseADomain' ] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const siteSlug = useSiteSlug();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'letsGetStarted':
					return navigate( 'chooseADomain' );

				case 'launchpad':
					return window.location.replace( `/view/${ siteSlug }` );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
