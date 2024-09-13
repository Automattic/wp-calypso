import { Onboard } from '@automattic/data-stores';
import { Design, isAssemblerDesign, isAssemblerSupported } from '@automattic/design-picker';
import { MIGRATION_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { isTargetSitePlanCompatible } from 'calypso/blocks/importer/util';
import { useIsSiteAssemblerEnabledExp } from 'calypso/data/site-assembler';
import { useIsBigSkyEligible } from 'calypso/landing/stepper/hooks/use-is-site-big-sky-eligible';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useExperiment } from 'calypso/lib/explat';
import { ImporterMainPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch as reduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { WRITE_INTENT_DEFAULT_DESIGN } from '../constants';
import { useIsPluginBundleEligible } from '../hooks/use-is-plugin-bundle-eligible';
import { useSiteData } from '../hooks/use-site-data';
import { useCanUserManageOptions } from '../hooks/use-user-can-manage-options';
import { ONBOARD_STORE, SITE_STORE, USER_STORE, STEPPER_INTERNAL_STORE } from '../stores';
import { shouldRedirectToSiteMigration } from './helpers';
import {
	useLaunchpadDecider,
	LAUNCHPAD_EXPERIMENT_NAME,
} from './internals/hooks/use-launchpad-decider';
import { STEPS } from './internals/steps';
import { redirect } from './internals/steps-repository/import/util';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type {
	OnboardSelect,
	SiteSelect,
	UserSelect,
	StepperInternalSelect,
} from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

type ExitFlowOptions = {
	skipLaunchpad?: boolean;
};

function isLaunchpadIntent( intent: string ) {
	return intent === SiteIntent.Write || intent === SiteIntent.Build;
}

const siteSetupFlow: Flow = {
	name: 'site-setup',
	isSignupFlow: false,

	useSideEffect( currentStep, navigate ) {
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);

		useEffect( () => {
			// Require to start the flow from the first step
			if ( currentStep === 'pattern-assembler' && ! selectedDesign ) {
				navigate( 'goals' );
			}
		}, [] );
	},

	useSteps() {
		return [
			STEPS.GOALS,
			STEPS.INTENT,
			STEPS.OPTIONS,
			STEPS.DESIGN_CHOICES,
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
			STEPS.LAUNCH_BIG_SKY,
			STEPS.VERIFY_EMAIL,
			STEPS.TRIAL_ACKNOWLEDGE,
			STEPS.PROCESSING,
			STEPS.ERROR,
			STEPS.DIFM_STARTING_POINT,
		];
	},
	useStepNavigation( currentStep, navigate ) {
		const stepData = useSelect(
			( select ) => ( select( STEPPER_INTERNAL_STORE ) as StepperInternalSelect ).getStepData(),
			[]
		);

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

		const { site, siteSlug, siteId } = useSiteData();
		const isSitePlanCompatible = site && isTargetSitePlanCompatible( site );
		const currentThemeId = useSelector( ( state ) => getActiveTheme( state, site?.ID || -1 ) );
		const currentTheme = useSelector( ( state ) =>
			getCanonicalTheme( state, site?.ID || -1, currentThemeId )
		);

		const isLaunched = site?.launch_status === 'launched' ? true : false;

		const urlQueryParams = useQuery();
		const isPluginBundleEligible = useIsPluginBundleEligible();

		const origin = urlQueryParams.get( 'origin' );
		const from = urlQueryParams.get( 'from' );
		const backToStep = urlQueryParams.get( 'backToStep' );
		const backToFlow = urlQueryParams.get( 'backToFlow' );
		const skippedCheckout = urlQueryParams.get( 'skippedCheckout' );

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

		const isSiteAssemblerEnabled = useIsSiteAssemblerEnabledExp( 'design-choices' );

		const { isEligible: isBigSkyEligible } = useIsBigSkyEligible();

		const isDesignChoicesStepEnabled =
			( isAssemblerSupported() && isSiteAssemblerEnabled ) || isBigSkyEligible;

		const { setPendingAction, resetOnboardStoreWithSkipFlags, setIntent } =
			useDispatch( ONBOARD_STORE );
		const { setDesignOnSite } = useDispatch( SITE_STORE );
		const dispatch = reduxDispatch();

		const [ isLoadingLaunchpadExperiment, launchpadExperimentAssigment ] =
			useExperiment( LAUNCHPAD_EXPERIMENT_NAME );

		const getLaunchpadScreenValue = (
			intent: string,
			shouldSkip: boolean
		): 'full' | 'skipped' | 'off' => {
			if ( ! isLaunchpadIntent( intent ) || isLaunched ) {
				return 'off';
			}

			if (
				isLoadingLaunchpadExperiment ||
				! launchpadExperimentAssigment?.variationName ||
				launchpadExperimentAssigment.variationName === 'control'
			) {
				if ( shouldSkip ) {
					return 'skipped';
				}

				return 'full';
			}

			if ( launchpadExperimentAssigment.variationName === 'treatment_no_launchpad' ) {
				return 'off';
			}

			if ( launchpadExperimentAssigment.variationName === 'treatment_skip_launchpad' ) {
				return 'skipped';
			}

			// We shouldn't get here, but match the default/existing behaviour
			if ( shouldSkip ) {
				return 'skipped';
			}

			return 'full';
		};

		const goToFlow = ( fullStepPath: string ) => {
			const path = `/setup/${ fullStepPath }`.replace( /([^:])(\/\/+)/g, '$1/' );

			return window.location.assign(
				addQueryArgs( { siteSlug, from, origin: `site-setup/${ currentStep }` }, path )
			);
		};

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
						settings.launchpad_screen = getLaunchpadScreenValue(
							siteIntent,
							options.skipLaunchpad ?? false
						);
					}

					let redirectionUrl = to;

					// Forcing cache invalidation to retrieve latest launchpad_screen option value
					if ( isLaunchpadIntent( siteIntent ) ) {
						redirectionUrl = addQueryArgs(
							{
								showLaunchpad: true,
								...( skippedCheckout && { skippedCheckout: 1 } ),
							},
							to
						);
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

		const { getPostFlowUrl, initializeLaunchpadState } = useLaunchpadDecider( {
			exitFlow,
			navigate,
		} );

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
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
						return navigate( 'pattern-assembler' );
					}

					return navigate( 'processing' );
				}
				case 'pattern-assembler':
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
						initializeLaunchpadState( { siteId, siteSlug } );
						const url = getPostFlowUrl( { flow: intent, siteId, siteSlug } );
						return exitFlow( url );
					}

					return exitFlow( `/home/${ siteId ?? siteSlug }` );
				}

				case 'bloggerStartingPoint': {
					const intent = params[ 0 ];
					switch ( intent ) {
						case 'firstPost': {
							const exitUrl = addQueryArgs( { new_prompt: true }, `/post/${ siteSlug }` );
							return exitFlow( exitUrl );
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
							return exitFlow( `/setup/site-migration?siteSlug=${ siteSlug }&ref=goals` );

						case SiteIntent.DIFM:
							return navigate( 'difmStartingPoint' );
						case SiteIntent.Write:
						case SiteIntent.Sell:
							return navigate( 'options' );
						default: {
							if ( isDesignChoicesStepEnabled ) {
								return navigate( 'design-choices' );
							}
							return navigate( 'designSetup' );
						}
					}
				}

				case 'design-choices': {
					return navigate( providedDependencies.destination as string );
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

				case 'courses': {
					return exitFlow( `/post/${ siteSlug }` );
				}

				case 'importList':
				case 'importReady': {
					const depUrl = ( providedDependencies?.url as string ) || '';
					const { platform } = providedDependencies as { platform: ImporterMainPlatform };

					if ( shouldRedirectToSiteMigration( currentStep, platform, origin ) ) {
						return window.location.assign(
							addQueryArgs(
								{ siteSlug, siteId, from },
								'/setup/site-migration/' + STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug
							)
						);
					}

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
						case 'customized-action-go-to-flow': {
							const customizedActionGoToFlow = urlQueryParams.get( 'customizedActionGoToFlow' );
							if ( customizedActionGoToFlow ) {
								return goToFlow( customizedActionGoToFlow );
							}
						}
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
						default: {
							if ( isDesignChoicesStepEnabled ) {
								return navigate( 'design-choices' );
							}
							return navigate( 'goals' );
						}
					}

				case 'design-choices': {
					return navigate( 'goals' );
				}

				case 'pattern-assembler': {
					if ( stepData?.previousStep ) {
						return navigate( stepData?.previousStep );
					}

					return navigate( 'designSetup' );
				}

				case 'importList':
					if ( backToStep ) {
						return navigate( `${ backToStep }?siteSlug=${ siteSlug }` );
					}

					if ( backToFlow ) {
						return goToFlow( backToFlow );
					}

					return navigate( `import?siteSlug=${ siteSlug }` );

				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
					if ( backToFlow ) {
						if ( urlQueryParams.get( 'ref' ) === MIGRATION_FLOW ) {
							return goToFlow( backToFlow );
						}
						return navigate( `importList?siteSlug=${ siteSlug }&backToFlow=${ backToFlow }` );
					}
					return navigate( `importList?siteSlug=${ siteSlug }` );

				case 'importerWordpress':
					if ( backToFlow ) {
						return goToFlow( backToFlow );
					}

					if ( urlQueryParams.get( 'option' ) === 'content' ) {
						return navigate( `importList?siteSlug=${ siteSlug }` );
					}

					if ( urlQueryParams.has( 'showModal' ) ) {
						// remove the siteSlug in case they want to change the destination site
						urlQueryParams.delete( 'siteSlug' );
						urlQueryParams.delete( 'showModal' );
						return navigate( `import?siteSlug=${ siteSlug }` );
					}

					if ( ! isSitePlanCompatible ) {
						urlQueryParams.set( 'showModal', 'true' );
						return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
					}

					return navigate( `import?siteSlug=${ siteSlug }` );
				case 'importerWix':
				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview':
					if ( backToFlow && urlQueryParams.get( 'ref' ) === MIGRATION_FLOW ) {
						return goToFlow( backToFlow );
					}

					return navigate( `import?siteSlug=${ siteSlug }` );

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
			switch ( step ) {
				case 'import':
					return navigate( `import?siteSlug=${ siteSlug }` );

				default:
					return navigate( step );
			}
		};

		return { goNext, goBack, goToStep, submit, exitFlow };
	},

	useAssertConditions(): AssertConditionResult {
		const { siteSlug, siteId } = useSiteData();
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
