import config from '@automattic/calypso-config';
import { Onboard, updateLaunchpadSettings } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { AI_ASSEMBLER_FLOW } from '@automattic/onboarding';
import { resolveSelect, useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import wpcomRequest from 'wpcom-proxy-request';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getTheme } from 'calypso/state/themes/selectors';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

const withAIAssemblerFlow: Flow = {
	name: AI_ASSEMBLER_FLOW,
	isSignupFlow: true,
	useSideEffect() {
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const { setSelectedDesign, setIntent } = useDispatch( ONBOARD_STORE );
		const selectedTheme = getAssemblerDesign().slug;
		const theme = useSelector( ( state ) => getTheme( state, 'wpcom', selectedTheme ) );

		// We have to query theme for the Jetpack site.
		useQueryTheme( 'wpcom', selectedTheme );

		useEffect( () => {
			if ( ! theme ) {
				// eslint-disable-next-line no-console
				console.log( `The ${ selectedTheme } theme is loading...` );
				return;
			}

			setSelectedDesign( {
				...selectedDesign,
				slug: theme.id,
				title: theme.name,
				recipe: {
					...selectedDesign?.recipe,
					stylesheet: theme.stylesheet,
				},
				design_type: 'assembler',
			} );

			setIntent( SiteIntent.AIAssembler );
		}, [ theme ] );
	},

	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.CHECK_SITES,
			STEPS.NEW_OR_EXISTING_SITE,
			STEPS.SITE_PICKER,
			STEPS.SITE_CREATION_STEP,
			STEPS.FREE_POST_SETUP,
			STEPS.PROCESSING,
			STEPS.LAUNCHPAD,
			STEPS.ERROR,
			STEPS.PLANS,
			STEPS.DOMAINS,
			STEPS.SITE_LAUNCH,
			STEPS.CELEBRATION,
		] );
	},

	useStepNavigation( _currentStep, navigate ) {
		const siteId = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedSite(),
			[]
		);

		const { setPendingAction, setSelectedSite } = useDispatch( ONBOARD_STORE );

		const { saveSiteSettings, setIntentOnSite, setDesignOnSite, setStaticHomepageOnSite } =
			useDispatch( SITE_STORE );

		const exitFlow = ( selectedSiteId: string, selectedSiteSlug: string ) => {
			setPendingAction( () => {
				return new Promise( () => {
					if ( ! selectedSiteId || ! selectedSiteSlug ) {
						return;
					}

					const pendingActions = [
						resolveSelect( SITE_STORE ).getSite( selectedSiteId ), // To get the URL.
					];

					// TODO: Query if we are indeed missing home page before creating new one.
					// Create the homepage.
					pendingActions.push(
						wpcomRequest( {
							path: '/sites/' + selectedSiteId + '/pages',
							method: 'POST',
							apiNamespace: 'wp/v2',
							body: {
								title: 'Home',
								status: 'publish',
							},
						} )
					);

					// Set the assembler theme
					pendingActions.push(
						setDesignOnSite( selectedSiteSlug, {
							theme: 'assembler',
						} )
					);

					Promise.all( pendingActions ).then( ( results ) => {
						// URL is in the results from the first promise.
						const siteURL = results[ 0 ].URL;
						const homePagePostId = results[ 1 ].id;
						// This will redirect and we will never resolve.
						setStaticHomepageOnSite( selectedSiteId, homePagePostId ).then( () =>
							window.location.assign(
								`${ siteURL }/wp-admin/site-editor.php?canvas=edit&postType=page&postId=${ homePagePostId }`
							)
						);
						return Promise.resolve();
					} );
				} );
			} );

			return navigate( 'processing' );
		};

		const handleSelectSite = ( providedDependencies: ProvidedDependencies = {} ) => {
			const selectedSiteSlug = providedDependencies?.siteSlug as string;
			const selectedSiteId = providedDependencies?.siteId as string;
			const isNewSite = providedDependencies?.isNewSite === 'true';
			setSelectedSite( selectedSiteId );
			setIntentOnSite( selectedSiteSlug, SiteIntent.AIAssembler );
			saveSiteSettings( selectedSiteId, { launchpad_screen: 'full' } );

			const params = new URLSearchParams( {
				siteSlug: selectedSiteSlug,
				siteId: selectedSiteId,
			} );

			if ( isNewSite ) {
				params.set( 'isNewSite', 'true' );
			}

			return exitFlow( selectedSiteId, selectedSiteSlug );
		};

		const submit = async (
			providedDependencies: ProvidedDependencies = {},
			...results: string[]
		) => {
			const selectedSiteSlug = providedDependencies?.siteSlug as string;
			const selectedSiteId = providedDependencies?.siteId as string;

			switch ( _currentStep ) {
				case 'check-sites': {
					// Check for unlaunched sites
					if ( providedDependencies?.filteredSitesCount === 0 ) {
						// No unlaunched sites, redirect to new site creation step
						return navigate( 'create-site' );
					}
					// With unlaunched sites, continue to new-or-existing-site step
					return navigate( 'new-or-existing-site' );
				}

				case 'new-or-existing-site': {
					if ( 'new-site' === providedDependencies?.newExistingSiteChoice ) {
						return navigate( 'create-site' );
					}
					return navigate( 'site-picker' );
				}

				case 'create-site': {
					return navigate( 'processing' );
				}

				case 'site-picker': {
					return handleSelectSite( providedDependencies );
				}

				case 'freePostSetup': {
					return navigate( 'launchpad' );
				}

				case 'processing': {
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					// If we just created a new site, navigate to the assembler step.
					if ( providedDependencies?.siteSlug && ! providedDependencies?.isLaunched ) {
						return handleSelectSite( {
							...providedDependencies,
							isNewSite: 'true',
						} );
					}

					// If the user's site has just been launched.
					if ( providedDependencies?.siteSlug && providedDependencies?.isLaunched ) {
						await saveSiteSettings( providedDependencies?.siteSlug, {
							launchpad_screen: 'off',
						} );
						return navigate( 'celebration-step' );
					}

					if ( providedDependencies?.goToCheckout ) {
						// Do nothing and wait for checkout redirect
						return;
					}

					return exitFlow( selectedSiteId, selectedSiteSlug );
				}

				case 'pattern-assembler': {
					return navigate( 'processing' );
				}

				case 'launchpad': {
					return navigate( 'processing' );
				}

				case 'plans': {
					await updateLaunchpadSettings( selectedSiteId, {
						checklist_statuses: { plan_completed: true },
					} );

					return navigate( 'launchpad' );
				}

				case 'domains': {
					await updateLaunchpadSettings( selectedSiteId, {
						checklist_statuses: { domain_upsell_deferred: true },
					} );

					if ( providedDependencies?.freeDomain && providedDependencies?.domainName ) {
						// We have to use the site id since the domain is changed.
						return navigate( `launchpad?siteId=${ selectedSiteId }` );
					}

					return navigate( 'launchpad' );
				}

				case 'site-launch':
					return navigate( 'processing' );

				case 'celebration-step': {
					return window.location.assign( providedDependencies.destinationUrl as string );
				}
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'site-picker': {
					return navigate( 'new-or-existing-site' );
				}

				case 'freePostSetup':
				case 'domain': {
					return navigate( 'launchpad' );
				}

				case 'pattern-assembler': {
					return navigate( 'site-prompt' );
				}
			}
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'site-prompt': {
					return navigate( 'pattern-assembler' );
				}

				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: AI_ASSEMBLER_FLOW,
						siteId: siteId || null,
						siteSlug: null,
					} );
					return;
			}
		};

		return { submit, goBack, goNext };
	},

	useAssertConditions(): AssertConditionResult {
		if ( ! config.isEnabled( 'calypso/ai-assembler' ) ) {
			window.location.assign( '/setup/assembler-first' );
		}

		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const currentPath = window.location.pathname;
		const isCreateSite =
			currentPath.endsWith( `setup/${ flowName }` ) ||
			currentPath.endsWith( `setup/${ flowName }/` ) ||
			currentPath.includes( `setup/${ flowName }/check-sites` );
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		useEffect( () => {
			if ( isLoggedIn && isCreateSite && ! userAlreadyHasSites ) {
				window.location.assign( `/setup/${ flowName }/create-site` );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( isLoggedIn && isCreateSite && ! userAlreadyHasSites ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } with no preexisting sites`,
			};
		}

		return result;
	},
};

export default withAIAssemblerFlow;
