import { useSelect } from '@wordpress/data';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE } from '../stores';
import type { StepPath } from './internals/steps-repository';
import type { Flow } from './internals/types';

function redirect( to: string ) {
	window.location.href = to;
}

export const siteSetupFlow: Flow = {
	useSteps() {
		return [ 'intent', 'options', 'designSetup', 'sell', 'bloggerStartingPoint', 'courses' ];
	},
	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlug = useSiteSlugParam();
		const { FSEActive } = useFSEStatus();

		function submit( ...params: string[] ) {
			switch ( currentStep ) {
				case 'options':
					return navigate( 'bloggerStartingPoint' );
				case 'designSetup': {
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
				case 'bloggerStartingPoint': {
					const intent = params[ 0 ];
					switch ( intent ) {
						case 'firstPost': {
							return redirect( `https://wordpress.com/post/${ siteSlug }` );
						}
						case 'courses': {
							return navigate( 'courses' );
						}
						default: {
							return navigate( intent as StepPath );
						}
					}
				}
				case 'intent': {
					const intent = params[ 0 ];
					switch ( intent ) {
						case 'wpadmin': {
							return redirect( `https://wordpress.com/home/${ siteSlug }` );
						}
						case 'build': {
							return navigate( 'designSetup' );
						}
						case 'import': {
							return redirect( `/start/importer/capture?siteSlug=${ siteSlug }` );
						}
						default: {
							return navigate( intent as StepPath );
						}
					}
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'bloggerStartingPoint':
					return navigate( 'options' );
				default:
					return navigate( 'intent' );
			}
		};
		const goNext = () => {
			switch ( currentStep ) {
				case 'options':
					return navigate( 'bloggerStartingPoint' );
				default:
					return navigate( 'intent' );
			}
		};
		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};
		return { goNext, goBack, goToStep, submit };
	},
};
