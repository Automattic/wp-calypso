import { Onboard, updateLaunchpadSettings } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { READYMADE_TEMPLATE_FLOW } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import deepmerge from 'deepmerge';
import { useSelector } from 'react-redux';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import wpcom from 'calypso/lib/wp';
import { ReadymadeTemplate } from 'calypso/my-sites/patterns/types';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import { useThemeDetails } from 'calypso/state/themes/hooks/use-theme-details';
import { CalypsoDispatch } from 'calypso/state/types';
import { useSiteData } from '../hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	Navigate,
	ProvidedDependencies,
	StepperStep,
} from './internals/types';
import type { GlobalStylesObject } from '@automattic/global-styles';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

const SiteIntent = Onboard.SiteIntent;

const readymadeTemplateFlow: Flow = {
	name: READYMADE_TEMPLATE_FLOW,
	isSignupFlow: true,
	useSideEffect() {
		const { setIntent } = useDispatch( ONBOARD_STORE );
		// We have to query theme for the Jetpack site.
		setIntent( SiteIntent.ReadyMadeTemplate );
	},

	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.CHECK_SITES,
			STEPS.SITE_CREATION_STEP,
			STEPS.FREE_POST_SETUP,
			STEPS.PROCESSING,
			STEPS.ERROR,
			STEPS.LAUNCHPAD,
			STEPS.PLANS,
			STEPS.DOMAINS,
			STEPS.SITE_LAUNCH,
			STEPS.CELEBRATION,
			STEPS.GENERATE_CONTENT,
		] );
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setPendingAction, setSelectedSite, setSelectedReadymadeTemplate } =
			useDispatch( ONBOARD_STORE );
		const { saveSiteSettings, setIntentOnSite, assembleSite } = useDispatch( SITE_STORE );
		const { site, siteSlug, siteId } = useSiteData();
		const reduxDispatch = useReduxDispatch();
		const selectedTheme = getAssemblerDesign().slug;
		const { value: readymadeTemplateId } = useUrlQueryParam( 'readymadeTemplateId' );
		const readymadeTemplate = useReadymadeTemplate( readymadeTemplateId );

		const handleSelectSite = ( providedDependencies: ProvidedDependencies = {} ) => {
			const selectedSiteSlug = providedDependencies?.siteSlug as string;
			const selectedSiteId = providedDependencies?.siteId as number;
			setSelectedSite( selectedSiteId );
			setIntentOnSite( selectedSiteSlug, SiteIntent.ReadyMadeTemplate );
			saveSiteSettings( selectedSiteId, { launchpad_screen: 'full' } );
			setSelectedReadymadeTemplate( readymadeTemplate );

			setPendingAction(
				enableAssemblerThemeAndConfigureTemplates(
					selectedTheme,
					selectedSiteId,
					selectedSiteSlug,
					readymadeTemplate,
					navigate,
					assembleSite,
					reduxDispatch
				)
			);

			navigate( 'processing' );
		};

		const submit = async (
			providedDependencies: ProvidedDependencies = {},
			...results: string[]
		) => {
			switch ( _currentStep ) {
				/**
				 * Check sites resets the onboarding store.
				 */
				case STEPS.CHECK_SITES.slug: {
					return navigate( 'create-site' );
				}

				case 'create-site': {
					return navigate( 'processing' );
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

					return;
				}

				case 'launchpad': {
					return navigate( 'processing' );
				}

				case 'plans': {
					await updateLaunchpadSettings( siteId, {
						checklist_statuses: { plan_completed: true },
					} );

					return navigate( 'launchpad' );
				}

				case 'domains': {
					await updateLaunchpadSettings( siteId, {
						checklist_statuses: { domain_upsell_deferred: true },
					} );

					if ( providedDependencies?.freeDomain && providedDependencies?.domainName ) {
						// We have to use the site id since the domain is changed.
						return navigate( `launchpad?siteId=${ site?.ID }` );
					}

					return navigate( 'launchpad' );
				}

				case 'site-launch':
					return navigate( 'processing' );

				case 'celebration-step':
					return window.location.assign( providedDependencies.destinationUrl as string );
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'freePostSetup':
				case 'generateContent':
				case 'domains': {
					return navigate( 'launchpad' );
				}
			}
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: READYMADE_TEMPLATE_FLOW,
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
		const isCreateSite =
			currentPath.endsWith( `setup/${ flowName }` ) ||
			currentPath.endsWith( `setup/${ flowName }/` );

		const userAlreadyHasSites = currentUserSiteCount && currentUserSiteCount > 0;

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

function enableAssemblerThemeAndConfigureTemplates(
	themeId: string,
	siteId: number,
	siteSlug: string,
	readymadeTemplate: ReadymadeTemplate & { globalStyles: GlobalStylesObject },
	navigate: Navigate< StepperStep[] >,
	assembleSite: (
		arg0: any,
		arg1: string,
		arg2: {
			/**
			 * @todo Separate the content in 3 sections. Ideally the entire template configuration should be done one the server, see the above comment.
			 *
			 * For now we piggyback on Site Assembler's API endpoint to apply the template on the site.
			 */
			homeHtml: any;
			headerHtml: string;
			footerHtml: string;
			pages: never[];
			globalStyles: object;
			canReplaceContent: boolean;
			// All sites using the assembler set the option wpcom_site_setup
			siteSetupOption: string;
		}
	) => Promise< never >,
	reduxDispatch: CalypsoDispatch
) {
	/**
	 * This is not optimal. We should have one request for all of it that simply passes the readyMadeTemplateId.
	 *
	 * Right now we make 3 requests:
	 * - Set the theme
	 * - Get the Readymade template (with content)
	 * - Apply the changes on the site (with the content that can be a large payload).
	 */
	return () =>
		Promise.resolve()
			.then( () =>
				reduxDispatch(
					activateOrInstallThenActivate( themeId, siteId, 'assembler', false ) as ThunkAction<
						PromiseLike< string >,
						any,
						any,
						AnyAction
					>
				)
			)
			.then( ( activeThemeStylesheet: string ) =>
				assembleSite( siteId, activeThemeStylesheet, {
					/**
					 * @todo Separate the content in 3 sections. Ideally the entire template configuration should be done one the server, see the above comment.
					 *
					 * For now we piggyback on Site Assembler's API endpoint to apply the template on the site.
					 */
					homeHtml: readymadeTemplate.home.content,
					headerHtml: readymadeTemplate.home.header,
					footerHtml: readymadeTemplate.home.footer,
					pages: [],
					globalStyles: readymadeTemplate.globalStyles,
					canReplaceContent: true,
					siteSetupOption: 'readymade-template',
				} )
			)
			.then( () => navigate( `launchpad?siteSlug=${ siteSlug }` ) );
}

function useReadymadeTemplate( templateId: number ) {
	const { data: readymadeTemplate } = useQuery( {
		queryKey: [ 'readymade-templates', templateId ],
		queryFn: async () =>
			wpcom.req.get( `/themes/readymade-templates/${ templateId }`, { apiNamespace: 'wpcom/v2' } ),
		enabled: !! templateId,
	} );

	const { data: assemblerTheme } = useThemeDetails( 'assembler' );

	if ( ! readymadeTemplate || ! assemblerTheme ) {
		return null;
	}

	const styleVariations = [] as GlobalStylesObject[];
	Object.values( readymadeTemplate.styles ?? [] ).forEach( ( readymadeTemplateStyleVariation ) => {
		const styleVariation = assemblerTheme.style_variations.find(
			( assemblerStyleVariation ) =>
				assemblerStyleVariation.slug === readymadeTemplateStyleVariation
		);
		if ( styleVariation ) {
			styleVariations.push( styleVariation );
		}
	} );
	readymadeTemplate.globalStyles = deepmerge.all( styleVariations );

	return readymadeTemplate;
}

export default readymadeTemplateFlow;
