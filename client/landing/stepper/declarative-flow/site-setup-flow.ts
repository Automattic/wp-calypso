import { isEnabled } from '@automattic/calypso-config';
import { useSelect } from '@wordpress/data';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

function redirect( to: string ) {
	window.location.href = to;
}

export const siteSetupFlow: Flow = {
	name: 'site-setup',

	useSteps() {
		return [
			...( isEnabled( 'signup/site-vertical-step' ) ? [ 'vertical' ] : [] ),
			'intent',
			'options',
			'designSetup',
			'bloggerStartingPoint',
			'courses',
			'storeFeatures',
			'businessInfo',
			'storeAddress',
			'processing',
		] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlug = useSiteSlugParam();
		const { FSEActive } = useFSEStatus();

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, intent, currentStep );

			switch ( currentStep ) {
				case 'options': {
					if ( intent === 'sell' ) {
						return navigate( 'storeFeatures' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'designSetup':
					return navigate( 'processing' );

				case 'processing': {
					// If the user skips starting point, redirect them to My Home
					if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
						if ( startingPoint !== 'write' ) {
							window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
						}

						return redirect( `/post/${ siteSlug }` );
					}

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
						case 'skip-to-my-home': {
							return redirect( `/home/${ siteSlug }` );
						}
						default: {
							return navigate( intent as StepPath );
						}
					}
				}

				case 'intent': {
					const submittedIntent = params[ 0 ];
					switch ( submittedIntent ) {
						case 'wpadmin': {
							return redirect( `https://wordpress.com/home/${ siteSlug }` );
						}
						case 'build': {
							return navigate( 'designSetup' );
						}
						case 'sell': {
							return navigate( 'options' );
						}
						case 'import': {
							return redirect( `/start/importer/capture?siteSlug=${ siteSlug }` );
						}
						case 'write': {
							return navigate( 'options' );
						}
						default: {
							return navigate( submittedIntent as StepPath );
						}
					}
				}

				case 'storeFeatures': {
					const storeType = params[ 0 ];
					if ( storeType === 'power' ) {
						if ( isEnabled( 'stepper-woocommerce-poc' ) ) {
							return navigate( 'storeAddress' );
						}

						const args = new URLSearchParams();
						args.append( 'back_to', `/start/setup-site/store-features?siteSlug=${ siteSlug }` );
						args.append( 'siteSlug', siteSlug as string );
						return redirect( `/start/woocommerce-install?${ args.toString() }` );
					} else if ( storeType === 'simple' ) {
						return navigate( 'designSetup' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'storeAddress':
					return navigate( 'businessInfo' );

				case 'businessInfo':
					return navigate( 'storeFeatures' );

				case 'courses': {
					return redirect( `/post/${ siteSlug }` );
				}

				case 'vertical': {
					return navigate( 'intent' );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'bloggerStartingPoint':
					return navigate( 'options' );

				case 'intent':
					return navigate( isEnabled( 'signup/site-vertical-step' ) ? 'vertical' : 'intent' );

				case 'storeFeatures':
					return navigate( 'options' );

				case 'storeAddress':
					return navigate( 'storeFeatures' );

				case 'courses':
					return navigate( 'bloggerStartingPoint' );

				case 'designSetup':
					if ( intent === 'sell' ) {
						// this means we came from sell => store-features => start simple, we go back to store features
						return navigate( 'storeFeatures' );
					} else if ( intent === 'write' ) {
						// this means we came from write => blogger staring point => choose a design
						return navigate( 'bloggerStartingPoint' );
					}
					return navigate( 'intent' );

				default:
					return navigate( 'intent' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				case 'options':
					if ( intent === 'sell' ) {
						return navigate( 'storeFeatures' );
					}
					return navigate( 'bloggerStartingPoint' );

				case 'intent':
					return redirect( `/home/${ siteSlug }` );

				case 'vertical':
					return redirect( `/home/${ siteSlug }` );

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
