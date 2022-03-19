import { useSelect } from '@wordpress/data';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

function redirect( to: string ) {
	window.location.href = to;
}

export const builderFlow: Flow = {
	useSteps() {
		return [ 'designSetup', 'domain' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlug = useSiteSlugParam();
		const { FSEActive } = useFSEStatus();

		function submit() {
			// If the user skips starting point, redirect them to My Home
			if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
				if ( startingPoint !== 'write' ) {
					window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
				}

				return redirect( `/post/${ siteSlug }` );
			}

			/*
			if ( ! FSEActive && intent === 'sell' ) {
				return `/page/${ siteSlug }/home`;
			}
			*/

			if ( FSEActive && intent !== 'write' ) {
				return redirect( `/site-editor/${ siteSlug }` );
			}

			return redirect( `/home/${ siteSlug }` );
		}

		const goBack = () => {
			if ( currentStep === 'designSetup' ) {
				navigate( 'domain' );
			} else {
				navigate( 'designSetup' );
			}
		};
		const goNext = goBack;
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep, submit };
	},
};
