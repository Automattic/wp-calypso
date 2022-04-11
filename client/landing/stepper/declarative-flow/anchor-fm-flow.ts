import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

function redirect( to: string ) {
	window.location.href = to;
}

export const anchorFmFlow: Flow = {
	name: 'anchor-fm',

	useSteps() {
		return [ 'podcastTitle', 'designSetup', 'fontPairing' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const siteSlug = useSiteSlugParam();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'anchor-fm', currentStep );

			switch ( currentStep ) {
				case 'podcastTitle':
					return navigate( 'designSetup' );
				case 'designSetup':
					return navigate( 'fontPairing' );
				case 'fontPairing':
					return redirect( `/page/home/${ siteSlug }` );
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'designSetup':
					return navigate( 'podcastTitle' );
				case 'fontPairing':
					return navigate( 'designSetup' );
				default:
					return navigate( 'podcastTitle' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				case 'podcastTitle':
					return navigate( 'designSetup' );
				case 'designSetup':
					return navigate( 'fontPairing' );
				case 'fontPairing':
					return redirect( `/page/home/${ siteSlug }` );

				default:
					return navigate( 'podcastTitle' );
			}
		};

		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
