import { Onboard } from '@automattic/data-stores';
import { DEFAULT_ASSEMBLER_DESIGN, isAssemblerSupported } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { ASSEMBLER_FIRST_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getTheme } from 'calypso/state/themes/selectors';
import { useSiteData } from '../hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
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

const assemblerFirstFlow: Flow = {
	name: ASSEMBLER_FIRST_FLOW,
	useSideEffect() {
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const { setSelectedDesign, setIntent } = useDispatch( ONBOARD_STORE );
		const selectedTheme = DEFAULT_ASSEMBLER_DESIGN.slug;
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

			setIntent( SiteIntent.AssemblerFirst );
		}, [ theme ] );
	},

	useSteps() {
		return [
			STEPS.CHECK_SITES,
			STEPS.NEW_OR_EXISTING_SITE,
			STEPS.SITE_PICKER,
			STEPS.SITE_CREATION_STEP,
			STEPS.PATTERN_ASSEMBLER,
			STEPS.PROCESSING,
			STEPS.ERROR,
			STEPS.LAUNCHPAD,
			STEPS.CELEBRATION,
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
		const { setPendingAction, setSelectedSite } = useDispatch( ONBOARD_STORE );
		const { saveSiteSettings, setIntentOnSite } = useDispatch( SITE_STORE );
		const { siteSlug, siteId } = useSiteData();

		const exitFlow = ( to: string ) => {
			setPendingAction( () => {
				return new Promise( () => {
					window.location.assign( to );
				} );
			} );

			return navigate( 'processing' );
		};

		const handleSelectSite = ( providedDependencies: ProvidedDependencies = {} ) => {
			const selectedSiteSlug = providedDependencies?.siteSlug as string;
			const selectedSiteId = providedDependencies?.siteId as string;
			const isNewSite = providedDependencies?.isNewSite === 'true';
			setSelectedSite( selectedSiteId );
			setIntentOnSite( selectedSiteSlug, SiteIntent.AssemblerFirst );
			saveSiteSettings( selectedSiteId, { launchpad_screen: 'full' } );

			// Check whether to go to the assembler. If not, go to the site editor directly
			let params;
			if ( ! isAssemblerSupported() ) {
				params = new URLSearchParams( {
					canvas: 'edit',
					assembler: '1',
				} );

				return `/site-editor/${ selectedSiteSlug }?${ params }`;
			}

			params = new URLSearchParams( {
				siteSlug: selectedSiteSlug,
				siteId: selectedSiteId,
			} );

			if ( isNewSite ) {
				params.set( 'isNewSite', 'true' );
			}

			return navigate( `patternAssembler?${ params }` );
		};

		const submit = async (
			providedDependencies: ProvidedDependencies = {},
			...results: string[]
		) => {
			recordSubmitStep( providedDependencies, intent, flowName, _currentStep );

			switch ( _currentStep ) {
				case 'check-sites': {
					// Check for unlaunched sites
					if ( providedDependencies?.filteredSitesCount === 0 ) {
						// No unlaunched sites, redirect to new site creation step
						return navigate( 'site-creation-step' );
					}
					// With unlaunched sites, continue to new-or-existing-site step
					return navigate( 'new-or-existing-site' );
				}

				case 'new-or-existing-site': {
					if ( 'new-site' === providedDependencies?.newExistingSiteChoice ) {
						return navigate( 'site-creation-step' );
					}
					return navigate( 'site-picker' );
				}

				case 'site-creation-step': {
					return navigate( 'processing' );
				}

				case 'site-picker': {
					return handleSelectSite( providedDependencies );
				}

				case 'processing': {
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					// If we just created a new site, navigate to the assembler step.
					if ( providedDependencies?.siteSlug && ! providedDependencies?.blogLaunched ) {
						return handleSelectSite( {
							...providedDependencies,
							isNewSite: 'true',
						} );
					}

					// If the user's site has just been launched.
					if ( providedDependencies?.siteSlug && providedDependencies?.blogLaunched ) {
						await saveSiteSettings( providedDependencies?.siteSlug, {
							launchpad_screen: 'off',
						} );
						return navigate( 'celebration-step' );
					}

					const params = new URLSearchParams( {
						canvas: 'edit',
						assembler: '1',
					} );

					return exitFlow( `/site-editor/${ siteSlug }?${ params }` );
				}

				case 'patternAssembler': {
					return navigate( 'processing' );
				}

				case 'launchpad': {
					return navigate( 'processing' );
				}

				case 'celebration-step':
					return window.location.assign( providedDependencies.destinationUrl as string );
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'site-picker': {
					return navigate( 'new-or-existing-site' );
				}

				case 'patternAssembler': {
					return window.location.assign( `/themes/${ siteSlug }` );
				}
			}
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: ASSEMBLER_FIRST_FLOW,
						siteId,
						siteSlug,
					} );
					return;
			}
		};

		return { submit, goBack, goNext };
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );
		const currentUserSiteCount = useSelector( getCurrentUserSiteCount );
		const currentPath = window.location.pathname;
		const isSiteCreationStep =
			currentPath.endsWith( `setup/${ flowName }` ) ||
			currentPath.endsWith( `setup/${ flowName }/` ) ||
			currentPath.includes( `setup/${ flowName }/check-sites` );
		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;
		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: window.location.href.replace( window.location.origin, '' ),
			locale,
		} );

		useEffect( () => {
			if ( ! isLoggedIn ) {
				window.location.assign( logInUrl );
			} else if ( isSiteCreationStep && ! userAlreadyHasSites ) {
				window.location.assign( `/setup/${ flowName }/site-creation-step` );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( isSiteCreationStep && ! userAlreadyHasSites ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } with no preexisting sites`,
			};
		}

		return result;
	},
};

export default assemblerFirstFlow;
