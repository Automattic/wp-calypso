import { isEnabled } from '@automattic/calypso-config';
import { Onboard, getThemeIdFromStylesheet } from '@automattic/data-stores';
import { useSelect, useDispatch } from '@wordpress/data';
import { useDispatch as reduxDispatch, useSelector } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { WRITE_INTENT_DEFAULT_DESIGN } from '../constants';
import { useComingFromThemeActivationParam } from '../hooks/use-coming-from-theme-activation';
import { useSite } from '../hooks/use-site';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { useCanUserManageOptions } from '../hooks/use-user-can-manage-options';
import { ONBOARD_STORE, SITE_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import GetCurrentThemeSoftwareSets from './internals/steps-repository/get-current-theme-software-sets';
import { redirect } from './internals/steps-repository/import/util';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
	StepperStep,
} from './internals/types';
import pluginBundleData from './plugin-bundle-data';
import type { BundledPlugin } from './plugin-bundle-data';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

const pluginBundleFlow: Flow = {
	name: 'plugin-bundle',

	useSteps() {
		const siteSlugParam = useSiteSlugParam();
		const pluginSlug = useSelect(
			( select ) =>
				( select( SITE_STORE ) as SiteSelect ).getBundledPluginSlug( siteSlugParam || '' ),
			[ siteSlugParam ]
		) as BundledPlugin;

		const steps = [
			{
				slug: 'getCurrentThemeSoftwareSets',
				component: GetCurrentThemeSoftwareSets,
			},
		];

		let bundlePluginSteps: StepperStep[] = [];

		if ( pluginSlug && pluginBundleData.hasOwnProperty( pluginSlug ) ) {
			bundlePluginSteps = pluginBundleData[ pluginSlug ];
		}
		return [ ...steps, ...bundlePluginSteps ];
	},
	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
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
		const currentUser = useSelector( getCurrentUser );
		const comingFromThemeActivation = useComingFromThemeActivationParam();

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
		const { setPendingAction, setStepProgress, resetOnboardStoreWithSkipFlags } =
			useDispatch( ONBOARD_STORE );
		const { setIntentOnSite, setGoalsOnSite, setDesignOnSite } = useDispatch( SITE_STORE );
		const siteDetails = useSelect(
			( select ) => site && ( select( SITE_STORE ) as SiteSelect ).getSite( site.ID ),
			[ site ]
		);
		const dispatch = reduxDispatch();

		// Since we're mimicking a subset of the site-setup-flow, we're safe to use the siteSetupProgress.
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
			recordSubmitStep( providedDependencies, intent, flowName, currentStep );

			let defaultExitDest = `/home/${ siteSlug }`;
			if ( siteDetails?.options?.theme_slug ) {
				const themeId = getThemeIdFromStylesheet( siteDetails?.options?.theme_slug );
				if ( isEnabled( 'themes/display-thank-you-page-for-woo' ) ) {
					defaultExitDest = `/marketplace/thank-you/${ siteSlug }?themes=${ themeId }`;
				} else {
					defaultExitDest = `/theme/${ themeId }/${ siteSlug }`;
				}
			}
			switch ( currentStep ) {
				case 'checkForWoo':
					// If WooCommerce is already installed, we should exit the flow.
					if ( providedDependencies?.hasWooCommerce ) {
						// If we have the theme for the site, redirect to the theme page. Otherwise redirect to /home.

						return exitFlow( defaultExitDest );
					}

					// Otherwise, we should continue to the next step.
					return navigate( 'storeAddress' );

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

					return exitFlow( defaultExitDest );
				}

				case 'wooTransfer':
					return navigate( 'processing' );
				case 'wooInstallPlugins':
					return navigate( 'processing' );
			}
		}

		const goBack = () => {
			if ( comingFromThemeActivation ) {
				return exitFlow( `/themes/${ siteSlug }` );
			}
			switch ( currentStep ) {
				case 'businessInfo':
					return navigate( 'storeAddress' );

				case 'wooConfirm':
					return navigate( 'businessInfo' );

				default:
					return navigate( 'checkForWoo' );
			}
		};

		const goNext = () => {
			switch ( currentStep ) {
				// TODO - Do we need anything here?
				default:
					return navigate( 'checkForWoo' );
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
