import { isEnabled } from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { Design, isAssemblerDesign, isAssemblerSupported } from '@automattic/design-picker';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch as reduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { WRITE_INTENT_DEFAULT_DESIGN } from '../constants';
import { useIsPluginBundleEligible } from '../hooks/use-is-plugin-bundle-eligible';
import { useSite } from '../hooks/use-site';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { useCanUserManageOptions } from '../hooks/use-user-can-manage-options';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { redirect } from './internals/steps-repository/import/util';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

type ExitFlowOptions = {
	skipLaunchpad?: boolean;
};

function isLaunchpadIntent( intent: string ) {
	return intent === SiteIntent.Write || intent === SiteIntent.Build;
}

const siteSetupFlow: Flow = {
	name: 'site-setup',

	useSideEffect( currentStep, navigate ) {
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);

		useEffect( () => {
			// Require to start the flow from the first step
			if ( currentStep === 'patternAssembler' && ! selectedDesign ) {
				navigate( 'goals' );
			}
		}, [] );
	},

	useSteps() {
		return [
			STEPS.GOALS,
			STEPS.INTENT,
			STEPS.OPTIONS,
			STEPS.DESIGN_SETUP,
			STEPS.PATTERN_ASSEMBLER,
			STEPS.BLOGGER_STARTING_POINT,
			STEPS.COURSES,
			STEPS.IMPORT,
			STEPS.IMPORT_LIGHT,
			STEPS.IMPORT_LIST,
			STEPS.IMPORT_READY,
			STEPS.IMPORT_READY_NOT,
			STEPS.IMPORT_READY_WPCOM,
			STEPS.IMPORT_READY_PREVIEW,
			STEPS.IMPORTER_WIX,
			STEPS.IMPORTER_BLOGGER,
			STEPS.IMPORTER_MEDIUM,
			STEPS.IMPORTER_SQUARESPACE,
			STEPS.IMPORTER_WORDPRESS,
			STEPS.VERIFY_EMAIL,
			STEPS.TRIAL_ACKNOWLEDGE,
			STEPS.BUSINESS_INFO,
			STEPS.STORE_ADDRESS,
			STEPS.PROCESSING,
			STEPS.ERROR,
			STEPS.WOO_TRANSFER,
			STEPS.WOO_INSTALL_PLUGINS,
			STEPS.WOO_VERIFY_EMAIL,
			STEPS.WOO_CONFIRM,
			STEPS.EDIT_EMAIL,
			STEPS.DIFM_STARTING_POINT,
		];
	},
	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
		const { getIntent } = useSelect( ( select ) => select( ONBOARD_STORE ) as OnboardSelect, [] );
		const goals = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
			[]
		);
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const startingPoint = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStartingPoint(),
			[]
		);
		const siteId = useSiteIdParam();
		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const currentUser = useSelector( getCurrentUser );
		const currentThemeId = useSelector( ( state ) => getActiveTheme( state, site?.ID || -1 ) );
		const currentTheme = useSelector( ( state ) =>
			getCanonicalTheme( state, site?.ID || -1, currentThemeId )
		);
		const isLaunched = site?.launch_status === 'launched' ? true : false;

		const urlQueryParams = useQuery();
		const isPluginBundleEligible = useIsPluginBundleEligible();

		let siteSlug: string | null = null;
		if ( siteSlugParam ) {
			siteSlug = siteSlugParam;
		} else if ( site ) {
			siteSlug = new URL( site.URL ).host;
		}

		const adminUrl = useSelect(
			( select ) =>
				site && ( select( SITE_STORE ) as SiteSelect ).getSiteOption( site.ID, 'admin_url' ),
			[ site ]
		);
		const isAtomic = useSelect(
			( select ) => site && ( select( SITE_STORE ) as SiteSelect ).isSiteAtomic( site.ID ),
			[ site ]
		);
		const storeType = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getStoreType(),
			[]
		);
		const { setPendingAction, setStepProgress, resetOnboardStoreWithSkipFlags, setIntent } =
			useDispatch( ONBOARD_STORE );
		const { setDesignOnSite } = useDispatch( SITE_STORE );
		const dispatch = reduxDispatch();

		const flowProgress = useSiteSetupFlowProgress( currentStep, intent );

		if ( flowProgress ) {
			setStepProgress( flowProgress );
		}

		const exitFlow = ( to: string, options: ExitFlowOptions = {} ) => {
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
					if ( ! siteSlug ) {
						return;
					}
					const siteId = site?.ID;
					const siteIntent = getIntent();

					const settings = {
						site_intent: siteIntent,
						site_goals: goals,
						launchpad_screen: undefined as string | undefined,
					};

					const formData: string[][] = [];
					const pendingActions = [];

					if ( siteIntent === SiteIntent.Write && ! selectedDesign && ! isAtomic ) {
						pendingActions.push( setDesignOnSite( siteSlug, WRITE_INTENT_DEFAULT_DESIGN ) );
					}

					// Update Launchpad option based on site intent
					if ( typeof siteId === 'number' ) {
						let launchpadScreen;
						if ( ! options.skipLaunchpad ) {
							launchpadScreen = isLaunchpadIntent( siteIntent ) && ! isLaunched ? 'full' : 'off';
						} else {
							launchpadScreen = 'skipped';
						}

						settings.launchpad_screen = launchpadScreen;
					}

					let redirectionUrl = to;

					// Forcing cache invalidation to retrieve latest launchpad_screen option value
					if ( isLaunchpadIntent( siteIntent ) ) {
						redirectionUrl = addQueryArgs( { showLaunchpad: true }, to );
					}

					formData.push( [ 'settings', JSON.stringify( settings ) ] );

					pendingActions.push(
						wpcomRequest( {
							path: `/sites/${ siteId }/onboarding-customization`,
							method: 'POST',
							apiNamespace: 'wpcom/v2',
							apiVersion: '2',
							formData,
						} )
					);

					Promise.all( pendingActions ).then( () => window.location.assign( redirectionUrl ) );
				} );
			} );

			navigate( 'processing' );

			// Clean-up the store so that if onboard for new site will be launched it will be launched with no preselected values
			resetOnboardStoreWithSkipFlags( [ 'skipPendingAction', 'skipIntent' ] );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			recordSubmitStep( providedDependencies, intent, flowName, currentStep );

			switch ( currentStep ) {
				case 'options': {
					if ( intent === 'sell' ) {
						/**
						 * Part of the theme/plugin bundling is simplyfing the seller flow.
						 *
						 * Instead of having the user manually choose between "Start simple" and "More power", we let them select a theme and use the theme choice to determine which path to take.
						 */
						return navigate( 'designSetup' );
					}
					return navigate( 'bloggerStartingPoint' );
				}

				case 'designSetup': {
					const { selectedDesign: _selectedDesign } = providedDependencies;
					if ( isAssemblerDesign( _selectedDesign as Design ) && isAssemblerSupported() ) {
						return navigate( 'patternAssembler' );
					}

					return navigate( 'processing' );
				}
				case 'patternAssembler':
					return navigate( 'processing' );

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					// End of Pattern Assembler flow
					if ( isAssemblerDesign( selectedDesign ) ) {
						const params = new URLSearchParams( {
							canvas: 'edit',
							assembler: '1',
						} );

						return exitFlow( `/site-editor/${ siteSlug }?${ params }` );
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
						theme_software_set &&
						theme_software_set.length > 0 &&
						isPluginBundleEligible &&
						siteSlug
					) {
						return exitFlow( `/setup/plugin-bundle/?siteSlug=${ siteSlug }` );
					}

					if ( isLaunchpadIntent( intent ) ) {
						const url = siteId
							? `/setup/${ intent }/launchpad?siteSlug=${ siteSlug }&siteId=${ siteId }`
							: `/setup/${ intent }/launchpad?siteSlug=${ siteSlug }`;
						return exitFlow( url );
					}
					return exitFlow( `/home/${ siteId ?? siteSlug }` );
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
							return exitFlow( `/home/${ siteId ?? siteSlug }`, {
								skipLaunchpad: true,
							} );
						}
						default: {
							return navigate( intent );
						}
					}
				}

				case 'goals': {
					const { intent } = providedDependencies;

					switch ( intent ) {
						case SiteIntent.Import:
							return navigate( 'import' );
						case SiteIntent.DIFM:
							return navigate( 'difmStartingPoint' );
						case SiteIntent.Write:
						case SiteIntent.Sell:
							return navigate( 'options' );
						default:
							return navigate( 'designSetup' );
					}
				}

				case 'intent': {
					const submittedIntent = params[ 0 ];
					switch ( submittedIntent ) {
						case 'wpadmin': {
							return exitFlow( `https://wordpress.com/home/${ siteId ?? siteSlug }` );
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
							return navigate( submittedIntent );
						}
					}
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

				case 'importReady': {
					const depUrl = ( providedDependencies?.url as string ) || '';

					if (
						depUrl.startsWith( 'http' ) ||
						[
							'blogroll',
							'ghost',
							'tumblr',
							'livejournal',
							'movabletype',
							'xanga',
							'substack',
						].indexOf( providedDependencies?.platform as ImporterMainPlatform ) !== -1
					) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
				}
				case 'importReadyPreview': {
					return navigate( providedDependencies?.url as string );
				}

				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
				}

				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					switch ( providedDependencies?.action ) {
						case 'verify-email':
							return navigate( `verifyEmail?${ urlQueryParams.toString() }` );
						case 'checkout':
							return exitFlow( providedDependencies?.checkoutUrl as string );
						default:
							return navigate( providedDependencies?.url as string );
					}
				}

				case 'trialAcknowledge': {
					switch ( providedDependencies?.action ) {
						case 'verify-email':
							return navigate( `verifyEmail?${ urlQueryParams.toString() }` );
						case 'importer':
							return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
						case 'checkout':
							return exitFlow( providedDependencies?.checkoutUrl as string );
						default:
							return;
					}
				}

				case 'verifyEmail':
					return navigate( `importerWordpress?${ urlQueryParams.toString() }` );

				case 'difmStartingPoint': {
					return exitFlow( `/start/website-design-services/?siteSlug=${ siteSlug }` );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case 'bloggerStartingPoint':
					return navigate( 'options' );

				case 'storeAddress':
					return navigate( 'options' );

				case 'businessInfo':
					return navigate( 'storeAddress' );

				case 'wooConfirm':
					return navigate( 'businessInfo' );

				case 'courses':
					return navigate( 'bloggerStartingPoint' );

				case 'designSetup':
					switch ( intent ) {
						case SiteIntent.DIFM:
							return navigate( 'difmStartingPoint' );
						case SiteIntent.Sell:
							return navigate( 'options' );
						case SiteIntent.Write:
							return navigate( 'bloggerStartingPoint' );
						default:
							return navigate( 'goals' );
					}

				case 'patternAssembler':
					return navigate( 'designSetup' );

				case 'editEmail':
					return navigate( 'wooVerifyEmail' );

				case 'importList':
					// eslint-disable-next-line no-case-declarations
					const backToStep = urlQueryParams.get( 'backToStep' );

					if ( backToStep ) {
						return navigate( `${ backToStep }?siteSlug=${ siteSlug }` );
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

				case 'options':
					return navigate( 'goals' );

				case 'import':
					return navigate( 'goals' );

				case 'verifyEmail':
				case 'trialAcknowledge':
					return navigate( `importerWordpress?${ urlQueryParams.toString() }` );

				case 'difmStartingPoint':
					return navigate( 'goals' );

				default:
					return navigate( 'intent' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				case 'options':
					if ( intent === 'sell' ) {
						return navigate( 'designSetup' );
					}
					return navigate( 'bloggerStartingPoint' );

				case 'intent':
					return exitFlow( `/home/${ siteId ?? siteSlug }` );

				case 'goals':
					// Skip to dashboard must have been pressed
					setIntent( SiteIntent.Build );
					return exitFlow( `/home/${ siteId ?? siteSlug }`, {
						skipLaunchpad: true,
					} );

				case 'import':
					return navigate( 'importList' );

				case 'difmStartingPoint':
					return navigate( 'designSetup' );

				default:
					return navigate( 'intent' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit, exitFlow };
	},

	useAssertConditions(): AssertConditionResult {
		const siteSlug = useSiteSlugParam();
		const siteId = useSiteIdParam();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const fetchingSiteError = useSelect(
			( select ) => ( select( SITE_STORE ) as SiteSelect ).getFetchingSiteError(),
			[]
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

		const { canManageOptions, isLoading } = useCanUserManageOptions();
		if ( isLoading ) {
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

export default siteSetupFlow;
