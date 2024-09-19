import { isEnabled } from '@automattic/calypso-config';
import { Onboard, getThemeIdFromStylesheet } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDispatch as reduxDispatch } from 'calypso/state';
import { WRITE_INTENT_DEFAULT_DESIGN } from '../constants';
import { useComingFromThemeActivationParam } from '../hooks/use-coming-from-theme-activation';
import { useSite } from '../hooks/use-site';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSitePluginSlug } from '../hooks/use-site-plugin-slug';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { useCanUserManageOptions } from '../hooks/use-user-can-manage-options';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import { redirect } from './internals/steps-repository/import/util';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
	StepperStep,
} from './internals/types';
import {
	initialBundleSteps,
	beforeCustomBundleSteps,
	afterCustomBundleSteps,
	bundleStepsSettings,
} from './plugin-bundle-data';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const getNextStep = ( currentStep: string, steps: string[] ): string | undefined => {
	const currentStepIndex = steps.indexOf( currentStep );
	const nextStep = steps[ currentStepIndex + 1 ];

	return nextStep;
};

const SiteIntent = Onboard.SiteIntent;

const pluginBundleFlow: Flow = {
	name: 'plugin-bundle',
	isSignupFlow: false,

	useSteps() {
		const pluginSlug = useSitePluginSlug();

		let bundlePluginSteps: StepperStep[] = [];

		if ( pluginSlug && bundleStepsSettings.hasOwnProperty( pluginSlug ) ) {
			bundlePluginSteps = [
				...beforeCustomBundleSteps,
				...bundleStepsSettings[ pluginSlug ].customSteps,
				...afterCustomBundleSteps,
			];
		}
		return [ ...initialBundleSteps, ...bundlePluginSteps ];
	},
	useStepNavigation( currentStep, navigate, steps = [] ) {
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
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
		const comingFromThemeActivation = useComingFromThemeActivationParam();

		let siteSlug: string | null = null;
		if ( siteSlugParam ) {
			siteSlug = siteSlugParam;
		} else if ( site ) {
			siteSlug = new URL( site.URL ).host;
		}

		const adminUrl = useSelect(
			( select ) =>
				String(
					( site &&
						( select( SITE_STORE ) as SiteSelect ).getSiteOption( site.ID, 'admin_url' ) ) ||
						''
				),
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
		const { setPendingAction, resetOnboardStoreWithSkipFlags } = useDispatch( ONBOARD_STORE );
		const { setIntentOnSite, setGoalsOnSite, setDesignOnSite } = useDispatch( SITE_STORE );
		const siteDetails = useSelect(
			( select ) => site && ( select( SITE_STORE ) as SiteSelect ).getSite( site.ID ),
			[ site ]
		);
		const dispatch = reduxDispatch();
		const pluginSlug = useSitePluginSlug();

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

					const pendingActions = [
						setIntentOnSite( siteSlug, intent ),
						setGoalsOnSite( siteSlug, goals ),
					];
					if ( intent === SiteIntent.Write && ! selectedDesign && ! isAtomic ) {
						pendingActions.push( setDesignOnSite( siteSlug, WRITE_INTENT_DEFAULT_DESIGN ) );
					}

					Promise.all( pendingActions ).then( () => window.location.assign( to ) );
				} );
			} );

			navigate( 'processing' );

			// Clean-up the store so that if onboard for new site will be launched it will be launched with no preselected values
			resetOnboardStoreWithSkipFlags( [ 'skipPendingAction' ] );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			let defaultExitDest = `/home/${ siteSlug }`;

			if ( siteDetails?.options?.theme_slug ) {
				const themeId = getThemeIdFromStylesheet( siteDetails?.options?.theme_slug );
				if ( isEnabled( 'themes/display-thank-you-page-for-bundle' ) ) {
					defaultExitDest = `/marketplace/thank-you/${ siteSlug }?themes=${ themeId }`;
				} else {
					defaultExitDest = `/theme/${ themeId }/${ siteSlug }`;
				}
			}

			if ( 'checkForPlugins' === currentStep ) {
				// If plugins are already installed, we should exit the flow.
				if ( providedDependencies?.hasPlugins ) {
					// If we have the theme for the site, redirect to the theme page. Otherwise redirect to /home.

					return exitFlow( defaultExitDest );
				}
			}

			const nextStep = getNextStep( currentStep, steps );

			if ( 'bundleConfirm' === nextStep ) {
				if ( isAtomic ) {
					return navigate( 'bundleInstallPlugins' );
				}
			}

			switch ( currentStep ) {
				case 'bundleConfirm': {
					const [ checkoutUrl ] = params;

					if ( checkoutUrl ) {
						window.location.replace( checkoutUrl.toString() );
					}

					return navigate( 'bundleTransfer' );
				}
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

					// Custom end of flow.
					const settings = bundleStepsSettings[ pluginSlug ];
					const endReturn = settings?.endFlow?.( {
						intent,
						storeType,
						adminUrl,
						dispatch,
						exitFlow,
					} );
					if ( settings?.endFlow && false !== endReturn ) {
						return endReturn;
					}

					return exitFlow( defaultExitDest );
				}
				case 'bundleTransfer': {
					return navigate( 'processing' );
				}
				default: {
					if ( nextStep ) {
						return navigate( nextStep );
					}
				}
			}
		}

		const goBack = () => {
			if ( comingFromThemeActivation ) {
				return exitFlow( `/themes/${ siteSlug }` );
			}

			// Custom back navigation.
			const navigateReturn = bundleStepsSettings[ pluginSlug ]?.goBack?.( currentStep, navigate );
			if ( false !== navigateReturn ) {
				return navigateReturn;
			}

			return navigate( 'checkForPlugins' );
		};

		const goNext = () => {
			switch ( currentStep ) {
				// TODO - Do we need anything here?
				default:
					return navigate( 'checkForPlugins' );
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

export default pluginBundleFlow;
