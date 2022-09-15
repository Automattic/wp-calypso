import { isEnabled } from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { Design, useDesignsBySite, isBlankCanvasDesign } from '@automattic/design-picker';
import { useIsEnglishLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDispatch as reduxDispatch, useSelector } from 'react-redux';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { useIsPluginBundleEligible } from '../hooks/use-is-plugin-bundle-eligible';
import { useSite } from '../hooks/use-site';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { useCanUserManageOptions } from '../hooks/use-user-can-manage-options';
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

const WRITE_INTENT_DEFAULT_THEME = 'livro';
const WRITE_INTENT_DEFAULT_THEME_STYLE_VARIATION = 'white';
const SiteIntent = Onboard.SiteIntent;
const SiteGoal = Onboard.SiteGoal;

export const siteSetupFlow: Flow = {
	name: 'site-setup',

	useSteps() {
		const isEnglishLocale = useIsEnglishLocale();
		const isEnabledFTM = isEnabled( 'signup/ftm-flow-non-en' ) || isEnglishLocale;

		return [
			...( isEnabled( 'signup/goals-step' ) && isEnabledFTM ? [ 'goals' ] : [] ),
			...( isEnabled( 'signup/site-vertical-step' ) && isEnabledFTM ? [ 'vertical' ] : [] ),
			'intent',
			'options',
			'designSetup',
			'patternAssembler',
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
			'difmStartingPoint',
		] as StepPath[];
	},
	useSideEffect() {
		// Prefetch designs for a smooth design picker UX.
		// Except for Unified Design Picker which uses a separate API endpoint (wpcom/v2/starter-designs).
		const site = useSite();
		useDesignsBySite( site, { enabled: !! site && ! isEnabled( 'signup/design-picker-unified' ) } );
	},
	useStepNavigation( currentStep, navigate ) {
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
		const goals = useSelect( ( select ) => select( ONBOARD_STORE ).getGoals() );
		const selectedDesign = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
		const startingPoint = useSelect( ( select ) => select( ONBOARD_STORE ).getStartingPoint() );
		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const currentUser = useSelector( getCurrentUser );
		const currentThemeId = useSelector( ( state ) => getActiveTheme( state, site?.ID || -1 ) );
		const currentTheme = useSelector( ( state ) =>
			getCanonicalTheme( state, site?.ID || -1, currentThemeId )
		);

		const isEnglishLocale = useIsEnglishLocale();
		const isEnabledFTM = isEnabled( 'signup/ftm-flow-non-en' ) || isEnglishLocale;
		const urlQueryParams = useQuery();
		const isPluginBundleEligible = useIsPluginBundleEligible();

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
		const { setPendingAction, setStepProgress, resetOnboardStoreWithSkipFlags } =
			useDispatch( ONBOARD_STORE );
		const { setIntentOnSite, setGoalsOnSite, setThemeOnSite } = useDispatch( SITE_STORE );
		const dispatch = reduxDispatch();
		const verticalsStepEnabled = isEnabled( 'signup/site-vertical-step' ) && isEnabledFTM;
		const goalsStepEnabled = isEnabled( 'signup/goals-step' ) && isEnabledFTM;

		const flowProgress = useSiteSetupFlowProgress( currentStep, intent, storeType );

		if ( flowProgress ) {
			setStepProgress( flowProgress );
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
					if ( ! siteSlug ) return;

					const pendingActions = [ setIntentOnSite( siteSlug, intent ) ];

					if ( goalsStepEnabled ) {
						pendingActions.push( setGoalsOnSite( siteSlug, goals ) );
					}
					if ( intent === SiteIntent.Write && ! selectedDesign && ! isAtomic ) {
						pendingActions.push(
							setThemeOnSite(
								siteSlug,
								WRITE_INTENT_DEFAULT_THEME,
								WRITE_INTENT_DEFAULT_THEME_STYLE_VARIATION
							)
						);
					}

					Promise.all( pendingActions ).then( () => window.location.assign( to ) );
				} );
			} );

			navigate( 'processing' );

			// Clean-up the store so that if onboard for new site will be launched it will be launched with no preselected values
			resetOnboardStoreWithSkipFlags( [ 'skipPendingAction' ] );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, intent, currentStep );

			switch ( currentStep ) {
				case 'options': {
					if ( intent === 'sell' ) {
						/**
						 * Part of the theme/plugin bundling is simplyfing the seller flow.
						 *
						 * Instead of having the user manually choose between "Start simple" and "More power", we let them select a theme and use the theme choice to determine which path to take.
						 */
						if ( isEnabled( 'themes/plugin-bundling' ) ) {
							return navigate( 'designSetup' );
						}

						return navigate( 'storeFeatures' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'designSetup':
					if ( isBlankCanvasDesign( providedDependencies?.selectedDesign as Design ) ) {
						return navigate( 'patternAssembler' );
					}

					return navigate( 'processing' );

				case 'patternAssembler':
					return navigate( 'processing' );

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					// End of Pattern Assembler flow
					if (
						isEnabled( 'signup/design-picker-pattern-assembler' ) &&
						isBlankCanvasDesign( selectedDesign as Design )
					) {
						return exitFlow( `/site-editor/${ siteSlug }` );
					}

					// If the user skips starting point, redirect them to the post editor
					if ( intent === 'write' && startingPoint !== 'skip-to-my-home' ) {
						if ( startingPoint !== 'write' ) {
							window.sessionStorage.setItem( 'wpcom_signup_complete_show_draft_post_modal', '1' );
						}

						return exitFlow( `/post/${ siteSlug }` );
					}

					// End of woo flow
					if ( intent === 'sell' && storeType === 'power' ) {
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

					// Check current theme: Does it have a plugin bundled?
					// If so, send them to the plugin-bundle flow.
					const theme_software_set = currentTheme?.taxonomies?.theme_software_set;
					if (
						isEnabled( 'themes/plugin-bundling' ) &&
						theme_software_set &&
						theme_software_set.length > 0 &&
						isPluginBundleEligible &&
						siteSlug
					) {
						return exitFlow( `/setup/?siteSlug=${ siteSlug }&flow=plugin-bundle` );
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
						return navigate( 'difmStartingPoint' );
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
							return navigate( 'difmStartingPoint' );
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
						window.location.replace( checkoutUrl.toString() );
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

				case 'importReady': {
					if (
						[ 'blogroll', 'ghost', 'tumblr', 'livejournal', 'movabletype', 'xanga' ].indexOf(
							providedDependencies?.platform as ImporterMainPlatform
						) !== -1
					) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as StepPath );
				}
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

				case 'difmStartingPoint': {
					return exitFlow( `/start/website-design-services/?siteSlug=${ siteSlug }` );
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
						// For theme/plugin bundling, we skip the store features step because we use the theme to decide if they're going through "Start simple" or "More power"
						if ( isEnabled( 'themes/plugin-bundling' ) ) {
							return navigate( 'options' );
						}

						// this means we came from sell => store-features => start simple, we go back to store features
						return navigate( 'storeFeatures' );
					} else if ( intent === 'write' ) {
						// this means we came from write => blogger staring point => choose a design
						return navigate( 'bloggerStartingPoint' );
					} else if ( intent === 'import' ) {
						// this means we came from non-WP transfers => complete screen => click Pick a design button, we go back to goals
						return navigate( 'goals' );
					}

					if ( goalsStepEnabled ) {
						if ( verticalsStepEnabled ) {
							return navigate( 'vertical' );
						}
						return navigate( 'goals' );
					}

					return navigate( 'intent' );

				case 'patternAssembler':
					return navigate( 'designSetup' );

				case 'editEmail':
					return navigate( 'wooVerifyEmail' );

				case 'importList':
					// eslint-disable-next-line no-case-declarations
					const backToStep = urlQueryParams.get( 'backToStep' );

					if ( backToStep ) {
						return navigate( `${ backToStep as StepPath }?siteSlug=${ siteSlug }` );
					}

					return navigate( 'import' );

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
					if ( intent === 'difm' ) {
						return navigate( 'difmStartingPoint' );
					}
					if ( goalsStepEnabled ) {
						return navigate( 'goals' );
					}

				case 'options':
					if ( goalsStepEnabled ) {
						if ( verticalsStepEnabled ) {
							return navigate( 'vertical' );
						}
						return navigate( 'goals' );
					}

				case 'import':
					if ( goalsStepEnabled ) {
						return navigate( 'goals' );
					}

				case 'difmStartingPoint':
					if ( goalsStepEnabled ) {
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

				case 'goals':
					// Skip to dashboard must have been pressed
					return exitFlow( `/home/${ siteSlug }` );

				case 'vertical':
					return exitFlow( `/home/${ siteSlug }` );

				case 'import':
					return navigate( 'importList' );

				case 'difmStartingPoint': {
					if ( verticalsStepEnabled ) {
						return navigate( 'vertical' );
					}

					return navigate( 'designSetup' );
				}

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
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! userIsLoggedIn ) {
			redirect( '/start' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'site-setup requires a logged in user',
			};
		}

		if ( ! siteSlug && ! siteId ) {
			redirect( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'site-setup did not provide the site slug or site id it is configured to.',
			};
		}

		if ( fetchingSiteError ) {
			redirect( '/' );
			result = {
				state: AssertConditionState.FAILURE,
				message: fetchingSiteError.message,
			};
		}

		const canManageOptions = useCanUserManageOptions();
		if ( canManageOptions === 'requesting' ) {
			result = {
				state: AssertConditionState.CHECKING,
			};
		} else if ( canManageOptions === false ) {
			redirect( '/start' );
			result = {
				state: AssertConditionState.FAILURE,
				message:
					'site-setup the user needs to have the manage_options capability to go through the flow.',
			};
		}

		return result;
	},
};
