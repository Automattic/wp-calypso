import { useSiteSlug } from '../hooks/use-site-slug';
import type { Flow, ProvidedDependencies } from './internals/types';

const podcasts: Flow = {
	name: 'podcasts',
	useSteps() {
		return [
			{
				slug: 'letsGetStarted',
				component: () => import( './internals/steps-repository/lets-get-started' ),
			},
			{
				slug: 'chooseADomain',
				component: () => import( './internals/steps-repository/choose-a-domain' ),
			},
		];
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

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default podcasts;
