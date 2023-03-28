import { isEnabled } from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { Design, isBlankCanvasDesign } from '@automattic/design-picker';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useDispatch as reduxDispatch, useSelector } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/route';
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
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const WRITE_INTENT_DEFAULT_THEME = 'livro';
const WRITE_INTENT_DEFAULT_THEME_STYLE_VARIATION = 'white';
const SiteIntent = Onboard.SiteIntent;
const SiteGoal = Onboard.SiteGoal;

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
			{ slug: 'goals', component: () => import( './internals/steps-repository/goals' ) },
			{ slug: 'vertical', component: () => import( './internals/steps-repository/site-vertical' ) },
			{ slug: 'intent', component: () => import( './internals/steps-repository/intent-step' ) },
			{ slug: 'options', component: () => import( './internals/steps-repository/site-options' ) },
			{
				slug: 'designSetup',
				component: () => import( './internals/steps-repository/design-setup' ),
			},
			{
				slug: 'patternAssembler',
				component: () => import( './internals/steps-repository/pattern-assembler/lazy' ),
			},
			{
				slug: 'bloggerStartingPoint',
				component: () => import( './internals/steps-repository/blogger-starting-point' ),
			},
			{ slug: 'courses', component: () => import( './internals/steps-repository/courses' ) },
			{ slug: 'import', component: () => import( './internals/steps-repository/import' ) },
			...( isEnabled( 'onboarding/import-light' )
				? [
						{
							slug: 'importLight',
							component: () => import( './internals/steps-repository/import-light' ),
						},
				  ]
				: [] ),
			{ slug: 'importList', component: () => import( './internals/steps-repository/import-list' ) },
			{
				slug: 'importReady',
				component: () => import( './internals/steps-repository/import-ready' ),
			},
			{
				slug: 'importReadyNot',
				component: () => import( './internals/steps-repository/import-ready-not' ),
			},
			{
				slug: 'importReadyWpcom',
				component: () => import( './internals/steps-repository/import-ready-wpcom' ),
			},
			{
				slug: 'importReadyPreview',
				component: () => import( './internals/steps-repository/import-ready-preview' ),
			},
			{
				slug: 'importerWix',
				component: () => import( './internals/steps-repository/importer-wix' ),
			},
			{
				slug: 'importerBlogger',
				component: () => import( './internals/steps-repository/importer-blogger' ),
			},
			{
				slug: 'importerMedium',
				component: () => import( './internals/steps-repository/importer-medium' ),
			},
			{
				slug: 'importerSquarespace',
				component: () => import( './internals/steps-repository/importer-squarespace' ),
			},
			{
				slug: 'importerWordpress',
				component: () => import( './internals/steps-repository/importer-wordpress' ),
			},
			{
				slug: 'businessInfo',
				component: () => import( './internals/steps-repository/business-info' ),
			},
			{
				slug: 'storeAddress',
				component: () => import( './internals/steps-repository/store-address' ),
			},
			{
				slug: 'processing',
				component: () => import( './internals/steps-repository/processing-step' ),
			},
			{ slug: 'error', component: () => import( './internals/steps-repository/error-step' ) },
			{
				slug: 'wooTransfer',
				component: () => import( './internals/steps-repository/woo-transfer' ),
			},
			{
				slug: 'wooInstallPlugins',
				component: () => import( './internals/steps-repository/woo-install-plugins' ),
			},
			...( isEnabled( 'signup/woo-verify-email' )
				? [
						{
							slug: 'wooVerifyEmail',
							component: () => import( './internals/steps-repository/woo-verify-email' ),
						},
				  ]
				: [] ),
			{ slug: 'wooConfirm', component: () => import( './internals/steps-repository/woo-confirm' ) },
			{ slug: 'editEmail', component: () => import( './internals/steps-repository/edit-email' ) },
			...( isEnabled( 'signup/woo-verify-email' )
				? [
						{
							slug: 'editEmail',
							component: () => import( './internals/steps-repository/edit-email' ),
						},
				  ]
				: [] ),
			{
				slug: 'difmStartingPoint',
				component: () => import( './internals/steps-repository/difm-starting-point' ),
			},
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
		const { setThemeOnSite } = useDispatch( SITE_STORE );
		const dispatch = reduxDispatch();

		const flowProgress = useSiteSetupFlowProgress( currentStep, intent );

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
						pendingActions.push(
							setThemeOnSite(
								siteSlug,
								WRITE_INTENT_DEFAULT_THEME,
								WRITE_INTENT_DEFAULT_THEME_STYLE_VARIATION
							)
						);
					}

					// Update Launchpad option based on site intent
					if ( typeof siteId === 'number' ) {
						const launchpadScreen =
							isLaunchpadIntent( siteIntent ) && ! isLaunched ? 'full' : 'off';

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
					const _selectedDesign = providedDependencies?.selectedDesign as Design;
					if ( _selectedDesign?.design_type === 'assembler' ) {
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
					if ( isBlankCanvasDesign( selectedDesign ) ) {
						window.sessionStorage.setItem( 'wpcom_signup_completed_flow', 'pattern_assembler' );
						return exitFlow( `/site-editor/${ siteSlug }?canvas=edit` );
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
						return exitFlow( `/setup/${ intent }/launchpad?siteSlug=${ siteSlug }` );
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
							return navigate( intent );
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

					return navigate( 'vertical' );
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

				case 'vertical': {
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

				case 'importReady': {
					const depUrl = ( providedDependencies?.url as string ) || '';

					if (
						depUrl.startsWith( 'http' ) ||
						[ 'blogroll', 'ghost', 'tumblr', 'livejournal', 'movabletype', 'xanga' ].indexOf(
							providedDependencies?.platform as ImporterMainPlatform
						) !== -1
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
				case 'importerSquarespace':
				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
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
					return navigate( 'vertical' );

				case 'storeAddress':
					return navigate( 'options' );

				case 'businessInfo':
					return navigate( 'storeAddress' );

				case 'wooConfirm':
					return navigate( 'businessInfo' );

				case 'courses':
					return navigate( 'bloggerStartingPoint' );

				case 'designSetup':
					if ( intent === 'sell' ) {
						return navigate( 'options' );
					} else if ( intent === 'write' ) {
						// this means we came from write => blogger staring point => choose a design
						return navigate( 'bloggerStartingPoint' );
					} else if ( intent === 'import' ) {
						// this means we came from non-WP transfers => complete screen => click Pick a design button, we go back to goals
						return navigate( 'goals' );
					}

					return navigate( 'vertical' );

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

				case 'vertical':
					if ( intent === 'difm' ) {
						return navigate( 'difmStartingPoint' );
					}
					return navigate( 'goals' );

				case 'options':
					return navigate( 'vertical' );

				case 'import':
					return navigate( 'goals' );

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
					return exitFlow( `/home/${ siteSlug }` );

				case 'goals':
					// Skip to dashboard must have been pressed
					setIntent( SiteIntent.Build );
					return exitFlow( `/home/${ siteSlug }` );

				case 'vertical':
					return exitFlow( `/home/${ siteSlug }` );

				case 'import':
					return navigate( 'importList' );

				case 'difmStartingPoint': {
					return navigate( 'vertical' );
				}

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

export default siteSetupFlow;
