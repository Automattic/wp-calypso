import { isEnabled } from '@automattic/calypso-config';
import { useSelect, useDispatch } from '@wordpress/data';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { StepPath } from './internals/steps-repository';
import type { Flow, ProvidedDependencies } from './internals/types';

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

	useStepNavigation( currentStep, navigate, exit ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlug = useSiteSlugParam();
		const dispatch = useDispatch( SITE_STORE );
		const { FSEActive } = useFSEStatus();

		const setIntentOnSite = () => dispatch.setIntentOnSite( siteSlug as string, intent );

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

						return exit( `/post/${ siteSlug }`, setIntentOnSite );
					}

					if ( FSEActive && intent !== 'write' ) {
						return exit( `/site-editor/${ siteSlug }`, setIntentOnSite );
					}

					return exit( `/home/${ siteSlug }`, setIntentOnSite );
				}

				case 'bloggerStartingPoint': {
					const intent = params[ 0 ];
					switch ( intent ) {
						case 'firstPost': {
							return exit( `https://wordpress.com/post/${ siteSlug }`, setIntentOnSite );
						}
						case 'courses': {
							return navigate( 'courses' );
						}
						case 'skip-to-my-home': {
							return exit( `/home/${ siteSlug }`, setIntentOnSite );
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
							return exit( `https://wordpress.com/home/${ siteSlug }`, setIntentOnSite );
						}
						case 'build': {
							return navigate( 'designSetup' );
						}
						case 'sell': {
							return navigate( 'options' );
						}
						case 'import': {
							return exit( `/start/importer/capture?siteSlug=${ siteSlug }`, setIntentOnSite );
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
						return exit( `/start/woocommerce-install?${ args.toString() }`, setIntentOnSite );
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
					return exit( `/post/${ siteSlug }`, setIntentOnSite );
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
					return exit( `/home/${ siteSlug }`, setIntentOnSite );

				case 'vertical':
					return exit( `/home/${ siteSlug }`, setIntentOnSite );

				default:
					return navigate( 'intent' );
			}
		};

		const goToStep = ( step: StepPath ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},

	useAssertConditions() {
		const siteSlug = useSiteSlugParam();
		const siteId = useSiteIdParam();

		if ( ! siteSlug && ! siteId ) {
			throw new Error( 'site-setup did not provide the site slug or site id it is configured to.' );
		}
	},
};
