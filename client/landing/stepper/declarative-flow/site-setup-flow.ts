import { isEnabled } from '@automattic/calypso-config';
import { useDesignsBySite } from '@automattic/design-picker';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDispatch as reduxDispatch } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSite } from '../hooks/use-site';
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
			'import',
			'importList',
			'importReady',
			'importReadyNot',
			'importReadyWpcom',
			'importReadyPreview',
			'businessInfo',
			'storeAddress',
			'processing',
			'error',
			'wooTransfer',
			'wooInstallPlugins',
			'wooConfirm',
		] as StepPath[];
	},
	useSideEffect() {
		const site = useSite();
		// prefetch designs for a smooth design picker UX
		useDesignsBySite( site );
	},
	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlug = useSiteSlugParam();
		const siteId = useSelect(
			( select ) => siteSlug && select( SITE_STORE ).getSiteIdBySlug( siteSlug )
		);
		const adminUrl = useSelect(
			( select ) => siteSlug && select( SITE_STORE ).getSiteOption( siteId as number, 'admin_url' )
		);
		const isAtomic = useSelect( ( select ) =>
			select( SITE_STORE ).isSiteAtomic( siteId as number )
		);
		const storeType = useSelect( ( select ) => select( ONBOARD_STORE ).getStoreType() );
		const { setPendingAction, setStepProgress } = useDispatch( ONBOARD_STORE );
		const { setIntentOnSite } = useDispatch( SITE_STORE );
		const { FSEActive } = useFSEStatus();
		const dispatch = reduxDispatch();

		// Set up Step progress for Woo flow - "Step 2 of 4"
		if ( intent === 'sell' && storeType === 'power' ) {
			switch ( currentStep ) {
				case 'storeAddress':
					setStepProgress( { progress: 1, count: 4 } );
					break;
				case 'businessInfo':
					setStepProgress( { progress: 2, count: 4 } );
					break;
				case 'wooConfirm':
					setStepProgress( { progress: 3, count: 4 } );
					break;
				case 'processing':
					setStepProgress( { progress: 4, count: 4 } );
					break;
			}
		} else {
			setStepProgress( undefined );
		}

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
						return navigate( 'error' );
					}

					// If the user skips starting point, redirect them to the post editor
					if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
						if ( startingPoint !== 'write' ) {
							window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
						}

						return exitFlow( `/post/${ siteSlug }` );
					}

					// End of woo flow
					if ( storeType === 'power' ) {
						dispatch( recordTracksEvent( 'calypso_woocommerce_dashboard_redirect' ) );

						return exitFlow( `${ adminUrl }/wp-admin/admin.php?page=wc-admin` );
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
							return navigate( 'import' );
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
					return navigate( 'wooConfirm' );
				}

				case 'wooConfirm': {
					const [ checkoutUrl ] = params;

					if ( checkoutUrl ) {
						return exitFlow( checkoutUrl.toString() );
					}

					return navigate( 'wooTransfer' );
				}

				case 'wooTransfer':
					return navigate( 'processing' );

				case 'wooInstallPlugins':
					return navigate( 'processing' );

				case 'courses': {
					return exitFlow( `/post/${ siteSlug }` );
				}

				case 'vertical': {
					return navigate( 'intent' );
				}

				case 'importReady':
				case 'importReadyPreview': {
					return exitFlow( providedDependencies?.url as string );
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

				case 'businessInfo':
					return navigate( 'storeAddress' );

				case 'wooConfirm':
					return navigate( 'businessInfo' );

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

				case 'importList':
				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview':
					return navigate( 'import' );

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

				case 'import':
					return navigate( 'importList' );

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
