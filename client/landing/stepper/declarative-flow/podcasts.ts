import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import ChooseADomain from './internals/steps-repository/choose-a-domain';
import LetsGetStarted from './internals/steps-repository/lets-get-started';
import type { Flow, ProvidedDependencies } from './internals/types';

const podcasts: Flow = {
	name: 'podcasts',
	useSteps() {
		return [
			{ slug: 'letsGetStarted', component: LetsGetStarted },
			{ slug: 'chooseADomain', component: ChooseADomain },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const siteId = useSiteIdParam();
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
					return window.location.replace( `/view/${ siteId ?? siteSlug }` );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default podcasts;
