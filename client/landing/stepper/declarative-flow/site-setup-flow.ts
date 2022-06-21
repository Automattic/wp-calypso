import { isEnabled } from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { useDesignsBySite } from '@automattic/design-picker';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDispatch as reduxDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { useFSEStatus } from '../hooks/use-fse-status';
import { useSite } from '../hooks/use-site';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { redirect } from './internals/steps-repository/import/util';
import { ProcessingResult } from './internals/steps-repository/processing-step';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { StepPath } from './internals/steps-repository';

const SiteIntent = Onboard.SiteIntent;
const SiteGoal = Onboard.SiteGoal;

export const siteSetupFlow: Flow = {
	name: 'site-setup',

	useSteps() {
		const isEnglishLocale = useIsEnglishLocale();

		return [
			...( isEnabled( 'signup/goals-step' ) && isEnglishLocale ? [ 'goals' ] : [] ),
			...( isEnabled( 'signup/site-vertical-step' ) && isEnglishLocale ? [ 'vertical' ] : [] ),
			'intent',
			'options',
			'designSetup',
			'bloggerStartingPoint',
			'courses',
			'storeFeatures',
			'import',
			...( isEnabled( 'onboarding/import-light' ) ? [ 'importLight' ] : [] ),
			'importList',
			'importReady',
			'importReadyNot',
			'importReadyWpcom',
			'importReadyPreview',
			'importerWix',
			'importerBlogger',
			'importerMedium',
			'importerSquarespace',
			'importerWordpress',
			'businessInfo',
			'storeAddress',
			'processing',
			'error',
			'wooTransfer',
			'wooInstallPlugins',
			...( isEnabled( 'signup/woo-verify-email' ) ? [ 'wooVerifyEmail' ] : [] ),
			'wooConfirm',
			'editEmail',
			...( isEnabled( 'signup/woo-verify-email' ) ? [ 'editEmail' ] : [] ),
			...( isEnabled( 'signup/theme-preview-screen' ) ? [ 'themeDesignPicker' ] : [] ),
		] as StepPath[];
	},
	useSideEffect() {
		const site = useSite();
		// prefetch designs for a smooth design picker UX
		useDesignsBySite( site );
	},
	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const goals = useSelect( ( select ) => select( ONBOARD_STORE ).getGoals() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const currentUser = useSelector( getCurrentUser );
		const isEnglishLocale = useIsEnglishLocale();

		let siteSlug: string | null = null;
		if ( siteSlugParam ) {
			siteSlug = siteSlugParam;
		} else if ( site ) {
			siteSlug = new URL( site.URL ).host;
		}

		const adminUrl = useSelect(
			( select ) => site && select( SITE_STORE ).getSiteOption( site.ID, 'admin_url' )
		);
		const isAtomic = useSelect(
			( select ) => site && select( SITE_STORE ).isSiteAtomic( site.ID )
		);
		const storeType = useSelect( ( select ) => select( ONBOARD_STORE ).getStoreType() );
		const { setPendingAction, setStepProgress } = useDispatch( ONBOARD_STORE );
		const { setIntentOnSite, setGoalsOnSite } = useDispatch( SITE_STORE );
		const { FSEActive } = useFSEStatus();
		const dispatch = reduxDispatch();
		const verticalsStepEnabled = isEnabled( 'signup/site-vertical-step' ) && isEnglishLocale;
		const goalsStepEnabled = isEnabled( 'signup/goals-step' ) && isEnglishLocale;

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
			setPendingAction( () => {
				/**
				 * This implementation seems very hacky.
				 * The new Promise returned is never resolved or rejected.
				 *
				 * If we were to resolve the promise when all pending actions complete,
				 * I found out this results in setIntentOnSite and setGoalsOnSite being called multiple times
				 * because the exitFlow itself is called more than once on actual flow exits.
				 */
				return new Promise( () => {
					const pendingActions = [ setIntentOnSite( siteSlug as string, intent ) ];
					if ( siteSlug && goalsStepEnabled ) {
						pendingActions.push( setGoalsOnSite( siteSlug, goals ) );
					}
					Promise.all( pendingActions ).then( () => redirect( to ) );
				} );
			} );

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

						if (
							isEnabled( 'signup/woo-verify-email' ) &&
							currentUser &&
							! currentUser.email_verified
						) {
							return navigate( 'wooVerifyEmail' );
						}
						return exitFlow( `${ adminUrl }admin.php?page=wc-admin` );
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

				case 'goals': {
					const { intent } = providedDependencies;

					if ( intent === SiteIntent.Import ) {
						return navigate( 'import' );
					}

					if ( intent === SiteIntent.DIFM ) {
						return exitFlow( `/start/website-design-services/?siteSlug=${ siteSlug }` );
					}

					if ( verticalsStepEnabled ) {
						return navigate( 'vertical' );
					}

					switch ( intent ) {
						case SiteIntent.Write:
						case SiteIntent.Sell:
							return navigate( 'options' );
						case SiteIntent.Build:
						default:
							return navigate( 'designSetup' );
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
						case 'difm': {
							return exitFlow( `/start/website-design-services/?siteSlug=${ siteSlug }` );
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

				case 'editEmail':
					return navigate( 'wooVerifyEmail' );

				case 'wooVerifyEmail': {
					if ( params[ 0 ] === 'edit-email' ) {
						return navigate( 'editEmail' );
					}

					return navigate( 'wooVerifyEmail' );
				}

				case 'courses': {
					return exitFlow( `/post/${ siteSlug }` );
				}

				case 'vertical': {
					if ( goalsStepEnabled ) {
						if ( goals.includes( SiteGoal.Import ) ) {
							return navigate( 'import' );
						}

						switch ( intent ) {
							case SiteIntent.Write:
							case SiteIntent.Sell:
								return navigate( 'options' );
							default:
								return navigate( 'designSetup' );
						}
					}

					return navigate( 'intent' );
				}

				case 'importReady':
				case 'importReadyPreview': {
					return navigate( providedDependencies?.url as StepPath );
				}

				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as StepPath );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'bloggerStartingPoint':
					return navigate( 'options' );

				case 'intent':
					return navigate( verticalsStepEnabled ? 'vertical' : 'intent' );

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

					if ( goalsStepEnabled ) {
						if ( verticalsStepEnabled ) {
							return navigate( 'vertical' );
						}
						return navigate( 'goals' );
					}

					return navigate( 'intent' );

				case 'editEmail':
					return navigate( 'wooVerifyEmail' );

				case 'importList':
				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview':
					return navigate( 'import' );

				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
				case 'importerWordpress':
					return navigate( 'import' );

				case 'vertical':
					if ( goalsStepEnabled ) {
						return navigate( 'goals' );
					}

				case 'options':
				case 'import':
					if ( goalsStepEnabled ) {
						// This can be unchecked when import step is shown after verticals.
						// if ( verticalsStepEnabled ) {
						// 	return navigate( 'vertical' );
						// }
						return navigate( 'goals' );
					}

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

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit, exitFlow };
	},

	useAssertConditions(): AssertConditionResult {
		const siteSlug = useSiteSlugParam();
		const siteId = useSiteIdParam();
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const fetchingSiteError = useSelect( ( select ) =>
			select( SITE_STORE ).getFetchingSiteError()
		);

		if ( ! userIsLoggedIn ) {
			redirect( '/start' );
			return {
				state: AssertConditionState.FAILURE,
				message: 'site-setup requires a logged in user',
			};
		}

		if ( ! siteSlug && ! siteId ) {
			redirect( '/' );
			return {
				state: AssertConditionState.FAILURE,
				message: 'site-setup did not provide the site slug or site id it is configured to.',
			};
		}

		if ( fetchingSiteError ) {
			redirect( '/' );
			return {
				state: AssertConditionState.FAILURE,
				message: fetchingSiteError.message,
			};
		}

		return { state: AssertConditionState.SUCCESS };
	},
};
