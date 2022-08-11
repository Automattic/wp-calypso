import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

export const promoteFlow: Flow = {
	name: 'promote',

	useSteps() {
		// useEffect( () => {
		// 	recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
		// }, [] );

		return [ 'promote' ] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		// function submit( providedDependencies: ProvidedDependencies = {} ) {
		function submit() {
			switch ( currentStep ) {
				case 'processing':
					return navigate( 'promote' );
			}
		}

		const goBack = () => {
			return;
			// switch ( currentStep ) {
			// 	case 'designSetup':
			// 		return navigate( 'podcastTitle' );
			// 	default:
			// 		return navigate( 'podcastTitle' );
			// }
		};

		const goNext = () => {
			return;
			// const siteSlug = siteSlugParam || getNewSite()?.site_slug;

			// switch ( currentStep ) {
			// 	case 'login':
			// 		return navigate( 'podcastTitle' );
			// 	case 'podcastTitle':
			// 		return navigate( 'designSetup' );
			// 	case 'designSetup':
			// 		return navigate( 'processing' );
			// 	case 'processing':
			// 		return redirect( `/page/${ siteSlug }/home` );
			// 	default:
			// 		return navigate( 'podcastTitle' );
			// }
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};
