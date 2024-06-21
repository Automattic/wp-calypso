import { Onboard, updateLaunchpadSettings } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { READYMADE_TEMPLATE_FLOW } from '@automattic/onboarding';
import { useQuery } from '@tanstack/react-query';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import useUrlQueryParam from 'calypso/a8c-for-agencies/hooks/use-url-query-param';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import wpcom from 'calypso/lib/wp';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import { getTheme } from 'calypso/state/themes/selectors';
import { CalypsoDispatch } from 'calypso/state/types';
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
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

const SiteIntent = Onboard.SiteIntent;

const readymadeTemplateFlow: Flow = {
	name: READYMADE_TEMPLATE_FLOW,
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

			setIntent( SiteIntent.ReadyMadeTemplate );
		}, [ theme ] );
	},

	useSteps() {
		return [
			STEPS.SITE_CREATION_STEP,
			STEPS.FREE_POST_SETUP,
			STEPS.PROCESSING,
			STEPS.ERROR,
			STEPS.LAUNCHPAD,
			STEPS.PLANS,
			STEPS.DOMAINS,
			STEPS.SITE_LAUNCH,
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
		const { saveSiteSettings, setIntentOnSite, assembleSite } = useDispatch( SITE_STORE );
		const { site, siteSlug, siteId } = useSiteData();

		const reduxDispatch = useReduxDispatch();

		const selectedTheme = getAssemblerDesign().slug;
		const theme = useSelector( ( state ) => getTheme( state, 'wpcom', selectedTheme ) );

		const { value: readymadeTemplateId } = useUrlQueryParam( 'readymadeTemplateId' );
		const { data: readymadeTemplate } = useReadymadeTemplate( readymadeTemplateId );

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
			const selectedSiteId = providedDependencies?.siteId as number;
			setSelectedSite( selectedSiteId );
			setIntentOnSite( selectedSiteSlug, SiteIntent.ReadyMadeTemplate );
			saveSiteSettings( selectedSiteId, { launchpad_screen: 'full' } );

			setPendingAction(
				enableAssemblerThemeAndConfigureTemplates(
					theme.id,
					selectedSiteId,
					readymadeTemplate,
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
			recordSubmitStep( providedDependencies, intent, flowName, _currentStep );

			switch ( _currentStep ) {
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

					if ( providedDependencies?.goToCheckout ) {
						// Do nothing and wait for checkout redirect
						return;
					}

					const params = new URLSearchParams( {
						canvas: 'edit',
						assembler: '1',
					} );

					return exitFlow( `/site-editor/${ siteSlug }?${ params }` );
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

		const locale = useFlowLocale();
		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: window.location.href.replace( window.location.origin, '' ),
			locale,
		} );

		useEffect( () => {
			if ( ! isLoggedIn ) {
				window.location.assign( logInUrl );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			result = {
				state: AssertConditionState.CHECKING,
				message: `${ flowName } requires a logged in user`,
			};
		} else if ( isCreateSite && ! userAlreadyHasSites ) {
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
	readymadeTemplate: { content: string },
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
					homeHtml: readymadeTemplate.content,
					headerHtml: '',
					footerHtml: '',
					pages: [],
					globalStyles: {},
					canReplaceContent: true,
					// All sites using the assembler set the option wpcom_site_setup
					siteSetupOption: 'assembler',
				} )
			)
			.then( () => window.location.assign( `/site-editor/${ siteId }?canvas=edit&assembler=1` ) );
}

function useReadymadeTemplate( templateId: number, options: object = { enabled: true } ) {
	return useQuery( {
		...options,
		queryKey: [ 'readymade-templates', templateId ],
		queryFn: async () =>
			wpcom.req.get( `/themes/readymade-templates/${ templateId }`, { apiNamespace: 'wpcom/v2' } ),
	} );
}

export default readymadeTemplateFlow;
