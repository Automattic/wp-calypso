import { isEnabled } from '@automattic/calypso-config';
import { useSelect, useDispatch } from '@wordpress/data';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProcessingResult } from './internals/steps-repository/processing-step';
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
			'error',
			'wooTransfer',
			'wooInstallPlugins',
		] as StepPath[];
	},

	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteId = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedSite() );
		const siteSlug = useSiteSlugParam();
		const isAtomic = useSelect( ( select ) =>
			select( SITE_STORE ).isSiteAtomic( siteId as number )
		);
		const storeType = useSelect( ( select ) => select( ONBOARD_STORE ).getStoreType() );
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const { setIntentOnSite } = useDispatch( SITE_STORE );
		const { FSEActive } = useFSEStatus();

		const exitFlow = ( to: string ) => {
			setPendingAction(
				() =>
					new Promise( () =>
						setIntentOnSite( siteSlug as string, intent ).then( () => redirect( to ) )
					)
			);

			navigate( 'processing' );
		};

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
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						// error page?
					}

					// If the user skips starting point, redirect them to My Home
					if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
						if ( startingPoint !== 'write' ) {
							window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
						}

						return exitFlow( `/post/${ siteSlug }` );
					}

					// End of woo flow
					if ( storeType === 'power' ) {
						// eslint-disable-next-line no-console
						console.log( 'end woo flow here' );
					}

					if ( FSEActive && intent !== 'write' ) {
						return exitFlow( `/site-editor/${ siteSlug }` );
					}

					return exitFlow( `/home/${ siteSlug }` );
				}

				case 'bloggerStartingPoint': {
					const intent = params[ 0 ];
					switch ( intent ) {
						case 'firstPost': {
							return exitFlow( `https://wordpress.com/post/${ siteSlug }` );
						}
						case 'courses': {
							return navigate( 'courses' );
						}
						case 'skip-to-my-home': {
							return exitFlow( `/home/${ siteSlug }` );
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
							return exitFlow( `https://wordpress.com/home/${ siteSlug }` );
						}
						case 'build': {
							return navigate( 'designSetup' );
						}
						case 'sell': {
							return navigate( 'options' );
						}
						case 'import': {
							return exitFlow( `/start/importer/capture?siteSlug=${ siteSlug }` );
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
						return exitFlow( `/start/woocommerce-install?${ args.toString() }` );
					} else if ( storeType === 'simple' ) {
						return navigate( 'designSetup' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'storeAddress':
					return navigate( 'businessInfo' );

				case 'businessInfo': {
					if ( isAtomic ) {
						return navigate( 'wooInstallPlugins' );
					}
					return navigate( 'wooTransfer' );
				}

				case 'wooTransfer':
					return navigate( 'processing' );

				case 'courses': {
					return exitFlow( `/post/${ siteSlug }` );
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
					return exitFlow( `/home/${ siteSlug }` );

				case 'vertical':
					return exitFlow( `/home/${ siteSlug }` );

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
