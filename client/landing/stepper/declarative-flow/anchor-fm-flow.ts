import { useSelect } from '@wordpress/data';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { SITE_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

function redirect( to: string ) {
	window.location.href = to;
}

export const anchorFmFlow: Flow = {
	name: 'anchor-fm',

	useSteps() {
		return [ 'podcastTitle', 'designSetup', 'processing' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const { getNewSite } = useSelect( ( select ) => select( SITE_STORE ) );
		const siteSlugParam = useSiteSlugParam();

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, 'anchor-fm', currentStep );
			const siteSlug = siteSlugParam || getNewSite()?.site_slug;

			switch ( currentStep ) {
				case 'podcastTitle':
					return navigate( 'designSetup' );
				case 'designSetup':
					return navigate( 'processing' );
				case 'processing':
					return redirect( `/page/${ siteSlug }/home` );
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'designSetup':
					return navigate( 'podcastTitle' );
				default:
					return navigate( 'podcastTitle' );
			}
		};

		const goNext = () => {
			const siteSlug = siteSlugParam || getNewSite()?.site_slug;

			switch ( currentStep ) {
				case 'podcastTitle':
					return navigate( 'designSetup' );
				case 'designSetup':
					return redirect( `/page/${ siteSlug }/home` );
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
