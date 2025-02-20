import { Onboard, updateLaunchpadSettings } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect, useRef } from 'react';
import wpcomRequest from 'wpcom-proxy-request';
import { isTargetSitePlanCompatible } from 'calypso/blocks/importer/util';
import { useIsBigSkyEligible } from 'calypso/landing/stepper/hooks/use-is-site-big-sky-eligible';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { ImporterMainPlatform } from 'calypso/lib/importer/types';
import { navigate as calypsoLibNavigate } from 'calypso/lib/navigate';
import { addQueryArgs } from 'calypso/lib/route';
import { useDispatch as reduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getInitialQueryArguments } from 'calypso/state/selectors/get-initial-query-arguments';
import { requestSite } from 'calypso/state/sites/actions';
import { getActiveTheme, getCanonicalTheme } from 'calypso/state/themes/selectors';
import { WRITE_INTENT_DEFAULT_DESIGN } from '../constants';
import { useActivateDesign } from '../hooks/use-activate-design';
import { useIsPluginBundleEligible } from '../hooks/use-is-plugin-bundle-eligible';
import { useSiteData } from '../hooks/use-site-data';
import { useCanUserManageOptions } from '../hooks/use-user-can-manage-options';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import { shouldRedirectToSiteMigration } from './helpers';
import { useLaunchpadDecider } from './internals/hooks/use-launchpad-decider';
import { STEPS } from './internals/steps';
import { redirect } from './internals/steps-repository/import/util';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	FlowV1,
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

function useGoalsAtFrontExperimentQueryParam() {
	return Boolean( useSelector( getInitialQueryArguments )?.[ 'goals-at-front-experiment' ] );
}

const siteSetupFlow: FlowV1 = {
	name: 'site-setup',
	isSignupFlow: false,

	useSteps() {
		const isGoalsAtFrontExperiment = useGoalsAtFrontExperimentQueryParam();

		const steps = [
			STEPS.GOALS,
			STEPS.INTENT,
			STEPS.OPTIONS,
			STEPS.DESIGN_CHOICES,
			STEPS.DESIGN_SETUP,
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

		if ( isGoalsAtFrontExperiment ) {
			return [ STEPS.PROCESSING, STEPS.ERROR ];
		}

		return steps;
	},
	useStepNavigation( currentStep, navigate ) {
		const isGoalsAtFrontExperiment = useGoalsAtFrontExperimentQueryParam();

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

		const { isEligible: isBigSkyEligible } = useIsBigSkyEligible();
		const isDesignChoicesStepEnabled = isBigSkyEligible;

		const { setPendingAction, resetOnboardStoreWithSkipFlags } = useDispatch( ONBOARD_STORE );
		const { setDesignOnSite } = useDispatch( SITE_STORE );
		const dispatch = reduxDispatch();

		const getLaunchpadScreenValue = (
			intent: string,
			shouldSkip: boolean
		): 'full' | 'skipped' | 'off' => {
			if ( ! isLaunchpadIntent( intent ) || isLaunched ) {
				return 'off';
			}

			if ( shouldSkip ) {
				return 'skipped';
			}

			return 'full';
		};

		const goToFlow = ( fullStepPath: string ) => {
			const path = `/setup/${ fullStepPath }`.replace( /([^:])(\/\/+)/g, '$1/' );
			const sessionId = urlQueryParams.get( 'sessionId' );

			return window.location.assign(
				addQueryArgs( { siteSlug, from, sessionId, origin: `site-setup/${ currentStep }` }, path )
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
						...( goals.length && { site_goals: goals } ),
						launchpad_screen: undefined as string | undefined,
					};

					const formData: string[][] = [];
					const pendingActions = [];

					if ( siteIntent === SiteIntent.Write && ! selectedDesign && ! isAtomic ) {
						pendingActions.push(
							setDesignOnSite( siteSlug, WRITE_INTENT_DEFAULT_DESIGN, { enableThemeSetup: true } )
						);
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
								...( isGoalsAtFrontExperiment && { 'goals-at-front-experiment': true } ),
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

					Promise.all( pendingActions )
						// Refetch the site to get the latest data, including the new intent.
						.then( () => dispatch( requestSite( siteSlug ) ) )
						.then( () => window.location.assign( redirectionUrl ) );
				} );
			} );

			navigate( 'processing' );

			// Clean-up the store so that if onboard for new site will be launched it will be launched with no preselected values
			resetOnboardStoreWithSkipFlags( [ 'skipPendingAction', 'skipIntent', 'skipGoals' ] );
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
					return navigate( 'processing' );
				}

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
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
							return exitFlow( `/post/${ siteSlug }` );
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
					const { intent, skip } = providedDependencies;

					if ( skip ) {
						return exitFlow( `/home/${ siteId ?? siteSlug }`, {
							skipLaunchpad: true,
						} );
					}

					switch ( intent ) {
						case SiteIntent.Import:
							return exitFlow( `/setup/site-migration?siteSlug=${ siteSlug }&ref=goals` );

						case SiteIntent.DIFM:
							return navigate( 'difmStartingPoint' );

						default: {
							if ( isDesignChoicesStepEnabled ) {
								return navigate( 'design-choices' );
							}
							return navigate( 'designSetup' );
						}
					}
				}

				case 'design-choices': {
					if ( providedDependencies.destination === 'launch-big-sky' ) {
						const queryParams = new URLSearchParams( location.search ).toString();
						calypsoLibNavigate(
							`/setup/site-setup/launch-big-sky${ queryParams ? `?${ queryParams }` : '' }`
						);
						return;
					}

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

					const url = providedDependencies?.url;
					if ( typeof url === 'string' ) {
						return navigate( addQueryArgs( { origin }, url ) );
					}
					return navigate( url as string );
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
					const backUrl = window.location.href.replace( window.location.origin, '' );
					return exitFlow(
						`/start/website-design-services/?siteSlug=${ siteSlug }&back_to=${ encodeURIComponent(
							backUrl
						) }`
					);
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
					if ( intent === SiteIntent.DIFM ) {
						return navigate( 'difmStartingPoint' );
					}
					if ( isDesignChoicesStepEnabled ) {
						return navigate( 'design-choices' );
					}
					return navigate( 'goals' );

				case 'design-choices': {
					return navigate( 'goals' );
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
						return navigate( addQueryArgs( { origin, siteSlug, backToFlow }, 'importList' ) );
					}
					return navigate( addQueryArgs( { origin, siteSlug }, 'importList' ) );

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
		const { site, siteSlug, siteId } = useSiteData();
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

		const isLoadingSite = ( siteSlug || siteId ) && ! site;
		const { canManageOptions, isLoading } = useCanUserManageOptions();
		if ( isLoadingSite || isLoading ) {
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

	useSideEffect() {
		const isGoalsAtFrontExperiment = useGoalsAtFrontExperimentQueryParam();
		const { siteSlugOrId, siteId } = useSiteData();
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const { selectedDesign, selectedStyleVariation, selectedGlobalStyles } = useSelect(
			( select ) => {
				const { getSelectedDesign, getSelectedStyleVariation, getSelectedGlobalStyles } = select(
					ONBOARD_STORE
				) as OnboardSelect;
				return {
					selectedDesign: getSelectedDesign(),
					selectedStyleVariation: getSelectedStyleVariation(),
					selectedGlobalStyles: getSelectedGlobalStyles(),
				};
			},
			[]
		);

		const dispatch = reduxDispatch();

		const skippedCheckout = useQuery().get( 'skippedCheckout' );

		const activateDesign = useActivateDesign();

		const isPendingActionSet = useRef( false );

		useEffect( () => {
			if ( ! isGoalsAtFrontExperiment || ! siteSlugOrId || ! siteId ) {
				return;
			}

			// Avoid the pending action to be triggered multiple times.
			if ( isPendingActionSet.current ) {
				return;
			}

			isPendingActionSet.current = true;
			setPendingAction( async () => {
				if ( ! selectedDesign ) {
					return;
				}

				try {
					await activateDesign( selectedDesign, {
						styleVariation: selectedStyleVariation,
						globalStyles: selectedGlobalStyles,
					} );
				} catch ( error: any ) {
					// We attempt to set the design on the site anyway even when the checkout is skipped.
					// That's because the user might have selected a free design, and there's no reason
					// we shouldn't set that design on the site when the checkout is skipped.
					// If the ThemeNotPurchasedError is thrown we know that they actually selected a
					// paid theme and we're unable to apply it.
					if ( error.name !== 'ThemeNotPurchasedError' || skippedCheckout !== '1' ) {
						throw error;
					}
				}

				const design_completed = selectedDesign?.default ? false : true;
				await updateLaunchpadSettings( siteSlugOrId, {
					checklist_statuses: { design_completed },
				} );
			} );
		}, [
			isGoalsAtFrontExperiment,
			siteSlugOrId,
			siteId,
			activateDesign,
			selectedDesign,
			setPendingAction,
			dispatch,
			selectedStyleVariation,
			selectedGlobalStyles,
			skippedCheckout,
		] );
	},
};

export default siteSetupFlow;
