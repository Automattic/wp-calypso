import { configureWordPressMigration } from '@automattic/api-core';
import config from '@automattic/calypso-config';
import { getUrlParts, isAllowedRedirectUrl } from '@automattic/calypso-url';
import { Onboard, type OnboardActions } from '@automattic/data-stores';
import { localizeUrl, useLocale } from '@automattic/i18n-utils';
import { SITE_MIGRATION_FLOW, STATIC_SITE_IMPORT_FLOW } from '@automattic/onboarding';
import { canInstallPlugins, type SiteExcerptData } from '@automattic/sites';
import { useQueryClient } from '@tanstack/react-query';
import { useDispatch } from '@wordpress/data';
import { useI18n } from '@wordpress/react-i18n';
import { useEffect, useRef } from 'react';
import { matchPath, useNavigate } from 'react-router';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	isPlatformImportable,
	getFullImporterUrl,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import {
	getProcessingErrorReason,
	type ProcessingResult,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { type CopySiteEligibility } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-check';
import { type SiteMigrationIdentifyAction } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-identify';
import { isHostingSupportedForSSHMigration } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-ssh-share-access/utils/hosting-provider-validation';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { goToImporter } from 'calypso/landing/stepper/declarative-flow/migration/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { useSiteQuery } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteCopy } from 'calypso/landing/stepper/hooks/use-site-copy';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE, SITE_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount, isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canUseStaticSiteImport } from '../static-site-import-flow/helpers';
import * as paths from './paths';
import type { FlowStateManifest } from '../../internals/state-manager/stepper-state-manifest';
import type {
	AssertConditionResult,
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';

const BASE_STEPS = [
	STEPS.SITE_MIGRATION_IDENTIFY,
	STEPS.IMPORT_LIST,
	STEPS.SITE_MIGRATION_CHECK,
	STEPS.SITE_MIGRATION_HOW_TO_MIGRATE,
	STEPS.SITE_MIGRATION_UPGRADE_PLAN,
	STEPS.SITE_MIGRATION_INSTRUCTIONS,
	STEPS.ERROR,
	STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS,
	STEPS.SITE_MIGRATION_CREDENTIALS,
	STEPS.SITE_MIGRATION_ALREADY_WPCOM,
	STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT,
	STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION,
	STEPS.SITE_MIGRATION_SUPPORT_INSTRUCTIONS,
	STEPS.SITE_MIGRATION_SSH_VERIFICATION,
	STEPS.SITE_MIGRATION_SSH_SHARE_ACCESS,
	STEPS.SITE_MIGRATION_SSH_IN_PROGRESS,
	STEPS.UNIFIED_PLANS,
	STEPS.PICK_SITE,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
];

function initialize() {
	const { pathname, search, hash } = window.location;
	if (
		! config.isEnabled( 'migration/reprint-flow' ) &&
		( matchPath( '/setup/:flow/site-migration-check/:lang?', pathname ) ||
			matchPath( '/setup/:flow/importList/:lang?', pathname ) ||
			matchPath( '/setup/:flow/plans/:lang?', pathname ) )
	) {
		window.location.replace(
			pathname.replace(
				/\/(site-migration-check|importList|plans)(?=\/|$)/,
				`/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`
			) +
				search +
				hash
		);
		return false as const;
	}
	// Landing pages (e.g. /move) analyze the URL themselves and deep link WordPress sources to the
	// site picker; send them through the site checks and plans instead. The router hasn't mounted
	// yet, so rewriting the URL in place avoids a second page load. Remove once landing pages link
	// to identify directly (see README).
	const query = new URLSearchParams( search );
	if (
		config.isEnabled( 'migration/reprint-flow' ) &&
		matchPath( '/setup/:flow/sitePicker/:lang?', pathname ) &&
		query.get( 'start' ) === 'true' &&
		query.get( 'platform' ) === 'wordpress' &&
		query.get( 'from' ) &&
		! query.get( 'sessionId' )
	) {
		window.history.replaceState(
			null,
			'',
			pathname.replace( /\/sitePicker(?=\/|$)/, `/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }` ) +
				search +
				hash
		);
	}
	if ( matchPath( '/setup/:flow/site-migration-import-or-migrate/:lang?', pathname ) ) {
		window.location.replace(
			pathname.replace(
				'/site-migration-import-or-migrate',
				`/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }`
			) +
				search +
				hash
		);
		return false as const;
	}

	return [
		STEPS.SITE_MIGRATION_IDENTIFY,
		...stepsWithRequiredLogin(
			BASE_STEPS.filter(
				( step ) =>
					step.slug !== STEPS.SITE_MIGRATION_IDENTIFY.slug &&
					( ( step.slug !== STEPS.SITE_MIGRATION_CHECK.slug &&
						step.slug !== STEPS.IMPORT_LIST.slug &&
						step.slug !== STEPS.UNIFIED_PLANS.slug ) ||
						config.isEnabled( 'migration/reprint-flow' ) )
			)
		),
	];
}

const hasSite = ( siteId: number, siteSlug: string ) => {
	return siteId && siteId !== 0 && siteSlug && siteSlug !== '';
};

// The authorization URL is fully query-controlled. Only allow navigating to an
// http(s) URL on the source site the user is migrating from — this rejects
// `javascript:`, `data:`, scheme-relative, and off-source destinations.
const isAuthorizationUrlAllowed = ( authorizationUrl?: string, from?: string | null ) => {
	if ( ! authorizationUrl || ! from ) {
		return false;
	}

	let sourceHostname;
	try {
		sourceHostname = new URL( from ).hostname;
	} catch {
		return false;
	}

	return isAllowedRedirectUrl( authorizationUrl, [ sourceHostname ] );
};

const siteMigration: FlowV2< typeof initialize > = {
	name: SITE_MIGRATION_FLOW,
	get isSignupFlow() {
		const searchParams = new URLSearchParams( window.location.search );
		const hasDestinationSite = [
			searchParams.has( 'siteSlug' ),
			searchParams.has( 'siteId' ),
		].some( Boolean );
		return ! hasDestinationSite;
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useSideEffect() {
		const { setIntent, resetOnboardStore } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			resetOnboardStore();
			setIntent( Onboard.SiteIntent.SiteMigration );
		}, [ resetOnboardStore, setIntent ] );
		const { set, get } = useFlowState();
		const urlQueryParams = useQuery();
		const ref = urlQueryParams.get( 'ref' );

		if ( ref && ! get( 'flow' )?.entryPoint ) {
			set( 'flow', { entryPoint: ref } );
		}
	},
	useAssertConditions(): AssertConditionResult {
		const { isAdmin } = useIsSiteAdmin();

		useEffect( () => {
			if ( isAdmin === false ) {
				window.location.assign( '/start' );
			}
		}, [ isAdmin ] );

		return { state: AssertConditionState.SUCCESS };
	},

	useStepsProps() {
		const { __ } = useI18n();
		const { siteId, siteSlug, site } = useSiteData();
		const { isError: hasSiteError, refetch: refetchSite } = useSiteQuery();
		const query = useQuery();
		const flowState = useFlowState();
		const handoff = flowState.get( 'migrationHandoff' );
		const { hostname, protocol } = getUrlParts( query.get( 'from' ) || '' );
		const checkSourceEligibility =
			config.isEnabled( 'migration/reprint-flow' ) &&
			query.get( 'isWpcom' ) === 'true' &&
			query.get( 'platform' ) === 'wordpress' &&
			!! hostname &&
			( protocol === 'http:' || protocol === 'https:' );
		const { data: sourceSite, isLoading: isLoadingSource } = useSiteQuery( hostname, {
			enabled: checkSourceEligibility,
		} );
		const { shouldShowSiteCopyItem, isFetching: isFetchingSiteCopy } = useSiteCopy(
			sourceSite ?? undefined,
			{ enabled: checkSourceEligibility }
		);
		let copySiteEligibility: CopySiteEligibility = 'ineligible';
		if ( checkSourceEligibility && ( isLoadingSource || isFetchingSiteCopy ) ) {
			copySiteEligibility = 'loading';
		} else if ( shouldShowSiteCopyItem ) {
			copySiteEligibility = 'eligible';
		}
		const hasDestination =
			config.isEnabled( 'migration/reprint-flow' ) &&
			query.get( 'how' ) !== HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME &&
			!! ( siteId || siteSlug );
		return {
			'site-migration-identify': {
				// A landing page hands over an address the user already submitted, so check it once on arrival.
				checkOnArrival:
					config.isEnabled( 'migration/reprint-flow' ) &&
					query.get( 'start' ) === 'true' &&
					! flowState.get( 'migrationArrivalChecked' ),
			},
			sitePicker: {
				skipConfirmation:
					config.isEnabled( 'migration/reprint-flow' ) &&
					query.get( 'platform' ) === 'wordpress' &&
					!! query.get( 'from' ) &&
					query.get( 'isWpcom' ) !== 'true' &&
					query.get( 'how' ) !== HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME &&
					query.get( 'action' ) !== 'import',
			},
			error: {
				showRetry:
					config.isEnabled( 'migration/reprint-flow' ) &&
					handoff?.from === query.get( 'from' ) &&
					handoff?.siteId === Number( query.get( 'siteId' ) ) &&
					handoff?.siteSlug === query.get( 'siteSlug' ) &&
					query.get( 'platform' ) === 'wordpress' &&
					query.get( 'isWpcom' ) !== 'true' &&
					query.get( 'how' ) !== HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME &&
					query.get( 'action' ) !== 'import',
			},
			'site-migration-check': {
				copySiteEligibility,
				destinationSiteSlug: hasDestination ? siteSlug : undefined,
				destinationSiteUrl: hasDestination ? site?.URL : undefined,
				destinationPlanName: site?.plan?.product_name_short || site?.plan?.product_name,
				needsUpgrade: hasDestination && !! site?.plan && ! canInstallPlugins( site ),
				isLoadingDestination: hasDestination && ! site?.plan && ! hasSiteError,
				destinationFailed: hasDestination && hasSiteError,
				onRetryDestination: refetchSite,
			},
			plans: {
				headerText: __( 'Ready to migrate' ),
				subHeaderText: hasDestination
					? __( 'Choose a plan to upgrade your site and continue the migration.' )
					: __( 'Choose a plan for your new site. Every paid plan includes the migration.' ),
				isInSignup: ! hasDestination,
				showExistingSiteLink: ! hasDestination,
				defaultInterval: 'yearly',
			},
		};
	},
	useStepNavigation( currentStep, navigate: NavigateV2< typeof BASE_STEPS > ) {
		const { __ } = useI18n();
		const navigateHistory = useNavigate();
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const { clearSiteSetupError, setSiteSetupError } = useDispatch( SITE_STORE );
		const handoffStarted = useRef( false );
		const handoffVersion = useRef( 0 );

		const flowName = this.name;
		const { siteId, siteSlug, site } = useSiteData();
		const variantSlug = this.variantSlug;
		const flowPath = variantSlug ?? flowName;
		const siteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );
		const isLoggedIn = useSelector( isUserLoggedIn );
		const locale = useLocale();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const copySourceSlug =
			currentStep === STEPS.SITE_MIGRATION_CHECK.slug && urlQueryParams.get( 'isWpcom' ) === 'true'
				? getUrlParts( fromQueryParam || '' ).hostname
				: undefined;
		const { data: copySourceSite } = useSiteQuery( copySourceSlug, {
			enabled: !! copySourceSlug,
		} );
		const { startSiteCopy } = useSiteCopy( copySourceSite ?? undefined, {
			enabled: !! copySourceSlug,
		} );
		const actionQueryParam = urlQueryParams.get( 'action' );
		const platformQueryParam = ( urlQueryParams.get( 'platform' ) ||
			'unknown' ) as ImporterPlatform;
		const hostQueryParam = urlQueryParams.get( 'host' ) || undefined;
		const { get, sessionId, queryKey } = useFlowState();
		const queryClient = useQueryClient();
		const userHasOtherWPComSites = siteCount && siteCount > 1;
		const shouldPickDestination = ! isLoggedIn || userHasOtherWPComSites;
		const entryPoint = get( 'flow' )?.entryPoint;
		const siteCanInstallPlugins = canInstallPlugins( site );
		const isReprintSource =
			config.isEnabled( 'migration/reprint-flow' ) &&
			actionQueryParam !== 'import' &&
			platformQueryParam === 'wordpress' &&
			!! fromQueryParam &&
			urlQueryParams.get( 'isWpcom' ) !== 'true' &&
			urlQueryParams.get( 'how' ) !== HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME;
		const isManualImport =
			config.isEnabled( 'migration/reprint-flow' ) &&
			( actionQueryParam === 'import' ||
				( ! fromQueryParam &&
					platformQueryParam !== 'unknown' &&
					platformQueryParam !== 'wordpress' ) );
		const handoff = get( 'migrationHandoff' );
		const savedHandoff =
			isReprintSource &&
			handoff?.from === fromQueryParam &&
			( ! urlQueryParams.has( 'siteId' ) ||
				urlQueryParams.get( 'siteId' ) === String( handoff.siteId ) ) &&
			( ! urlQueryParams.has( 'siteSlug' ) ||
				urlQueryParams.get( 'siteSlug' ) === handoff.siteSlug )
				? handoff
				: undefined;
		const recoveryPlansPath = savedHandoff
			? paths.plansPath( {
					from: savedHandoff.from,
					siteId: savedHandoff.siteId,
					siteSlug: savedHandoff.siteSlug,
				} )
			: undefined;
		const configureAndContinue = async (
			destinationId: number,
			destinationSlug: string,
			from: string,
			shouldGoToCheckout = false,
			plan?: string
		) => {
			if ( handoffStarted.current ) {
				return;
			}
			handoffStarted.current = true;
			// Preserve the created-site record written after this navigation handler rendered.
			queryClient.setQueryData< Partial< FlowStateManifest > >( queryKey, ( state ) => ( {
				...state,
				migrationHandoff: {
					siteId: destinationId,
					siteSlug: destinationSlug,
					from,
					shouldGoToCheckout,
					plan,
				},
			} ) );
			const version = handoffVersion.current;
			clearSiteSetupError();
			try {
				await configureWordPressMigration( destinationId, { source_url: from } );
				if ( version !== handoffVersion.current ) {
					return;
				}
				const destination = addQueryArgs(
					{
						ref: entryPoint || urlQueryParams.get( 'ref' ) || SITE_MIGRATION_FLOW,
						source: urlQueryParams.get( 'source' ),
						sessionId,
						flags: urlQueryParams.get( 'flags' ),
					},
					dashboardLink( `/sites/${ destinationSlug }/migration-overview` )
				);
				if ( shouldGoToCheckout ) {
					return goToCheckout( {
						flowName: flowPath,
						stepName: STEPS.UNIFIED_PLANS.slug,
						siteSlug: destinationSlug,
						destination,
						plan,
						cancelDestination: addQueryArgs(
							{
								...Object.fromEntries( urlQueryParams ),
								siteId: destinationId,
								siteSlug: destinationSlug,
							},
							`/setup/${ flowPath }/${ STEPS.UNIFIED_PLANS.slug }`
						),
					} );
				}
				window.location.assign( destination );
			} catch {
				if ( version === handoffVersion.current ) {
					handoffStarted.current = false;
					setSiteSetupError(
						'migration_configuration_failed',
						__(
							'We couldn’t prepare your site for migration. Please try again or contact support.'
						)
					);
					navigate(
						paths.errorPath( { siteId: destinationId, siteSlug: destinationSlug } ),
						undefined,
						true
					);
				}
			}
		};
		const showWordpressDestination = (
			destinationId: number,
			destinationSlug: string,
			from: string
		) => {
			if ( currentStep !== STEPS.SITE_MIGRATION_CHECK.slug ) {
				return navigate(
					paths.siteCheckPath( {
						from,
						siteId: destinationId,
						siteSlug: destinationSlug,
						isWpcom: false,
					} )
				);
			}
			if ( ! site?.plan ) {
				return;
			}
			if ( ! siteCanInstallPlugins ) {
				return navigate( paths.plansPath( { from } ) );
			}
			return configureAndContinue( destinationId, destinationSlug, from );
		};
		const queryString = urlQueryParams.toString();
		useEffect(
			() => () => {
				handoffVersion.current++;
				handoffStarted.current = false;
			},
			[ currentStep, queryString ]
		);

		useEffect( () => {
			if (
				recoveryPlansPath &&
				! handoffStarted.current &&
				! urlQueryParams.has( 'siteId' ) &&
				! urlQueryParams.has( 'siteSlug' ) &&
				( currentStep === STEPS.UNIFIED_PLANS.slug ||
					currentStep === STEPS.SITE_CREATION_STEP.slug )
			) {
				navigate( recoveryPlansPath, undefined, true );
			}
		}, [ currentStep, recoveryPlansPath, navigate, urlQueryParams ] );

		const exitFlow = ( to: string, replace = false ) => {
			if ( replace ) {
				return window.location.replace(
					addQueryArgs( { sessionId, ref: SITE_MIGRATION_FLOW }, to )
				);
			}
			return window.location.assign( addQueryArgs( { sessionId, ref: SITE_MIGRATION_FLOW }, to ) );
		};

		const recordSignupComplete = useRecordSignupComplete( flowName );
		const replace = (
			to: Parameters< typeof navigate >[ 0 ],
			state?: Parameters< typeof navigate >[ 1 ]
		) => navigate( to, state, true );

		// Call triggerGuidesForStep for the current step
		useEffect( () => {
			triggerGuidesForStep( flowName, currentStep, siteId );
		}, [ flowName, currentStep, siteId ] );

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug:
				case STEPS.SITE_MIGRATION_CHECK.slug: {
					const { from, platform, action, host, isWpcom } = providedDependencies as {
						from: string;
						platform: ImporterPlatform;
						action:
							| SiteMigrationIdentifyAction
							| 'back'
							| 'select-existing-site'
							| 'copy-site'
							| 'transfer-domain'
							| 'get-access';
						host?: string;
						isWpcom?: boolean;
					};
					if ( slug === STEPS.SITE_MIGRATION_IDENTIFY.slug && ! get( 'migrationArrivalChecked' ) ) {
						queryClient.setQueryData< Partial< FlowStateManifest > >( queryKey, ( state ) => ( {
							...state,
							migrationArrivalChecked: true,
						} ) );
					}
					const { hostname, protocol } = getUrlParts( from || '' );
					if (
						slug === STEPS.SITE_MIGRATION_CHECK.slug &&
						config.isEnabled( 'migration/reprint-flow' ) &&
						urlQueryParams.get( 'isWpcom' ) === 'true' &&
						platform === 'wordpress' &&
						hostname &&
						( protocol === 'http:' || protocol === 'https:' )
					) {
						if ( action === 'copy-site' ) {
							startSiteCopy();
							return exitFlow( addQueryArgs( { sourceSlug: hostname }, '/setup/copy-site' ) );
						}
						if ( action === 'transfer-domain' ) {
							return exitFlow( addQueryArgs( { new: hostname }, '/setup/domain-transfer/intro' ) );
						}
						if ( action === 'get-access' ) {
							return window.location.assign(
								localizeUrl( 'https://wordpress.com/support/account-recovery/' )
							);
						}
					}
					if (
						slug === STEPS.SITE_MIGRATION_CHECK.slug &&
						( action === 'back' ||
							! config.isEnabled( 'migration/reprint-flow' ) ||
							! from ||
							platform !== 'wordpress' ||
							isWpcom ||
							urlQueryParams.get( 'isWpcom' ) === 'true' )
					) {
						return replace( STEPS.SITE_MIGRATION_IDENTIFY.slug );
					}
					const hasDestinationSite = hasSite( siteId, siteSlug );
					if (
						config.isEnabled( 'migration/reprint-flow' ) &&
						action === 'skip_platform_identification'
					) {
						if ( from ) {
							replace( paths.identifyPath( { from } ) );
						}
						return navigate(
							paths.importListPath( {
								from: from || '',
								platform: 'unknown',
								host: '',
								isWpcom: '',
								ssh: '',
								action: from ? 'import' : '',
								how: '',
							} )
						);
					}

					const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );
					const isHostingSupported = isHostingSupportedForSSHMigration( host );
					const canUseSSHMigration =
						isSSHMigrationAvailable && isHostingSupported && locale === 'en';

					// Track hosting provider detection
					const recordHostingDetected = ( redirectedToSSH: boolean ) =>
						recordTracksEvent( 'calypso_site_migration_hosting_detected', {
							hosting_provider: host || 'unknown',
							is_ssh_supported: isHostingSupported,
							ssh_feature_enabled: isSSHMigrationAvailable,
							is_english_locale: locale === 'en',
							redirected_to_ssh: redirectedToSSH,
						} );

					if (
						slug === STEPS.SITE_MIGRATION_IDENTIFY.slug &&
						config.isEnabled( 'migration/reprint-flow' ) &&
						action === 'continue' &&
						platform === 'wordpress' &&
						from
					) {
						recordHostingDetected( false );
						return navigate(
							paths.siteCheckPath( { from, platform, host: host ?? '', isWpcom: !! isWpcom } )
						);
					}
					if (
						slug === STEPS.SITE_MIGRATION_CHECK.slug &&
						urlQueryParams.get( 'how' ) !== HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME
					) {
						if ( action === 'select-existing-site' ) {
							return navigate( paths.sitePickerPath( { from, siteId: '', siteSlug: '' } ) );
						}
						if ( hasDestinationSite ) {
							return showWordpressDestination( siteId, siteSlug, from );
						}
						return navigate( paths.plansPath( { from } ) );
					}
					recordHostingDetected( canUseSSHMigration );

					if ( canUseSSHMigration ) {
						if ( hasDestinationSite && siteCanInstallPlugins ) {
							return navigate( paths.sshVerificationPath( { siteId, siteSlug, from, host } ) );
						}

						if ( hasDestinationSite ) {
							return navigate(
								paths.upgradePlanPath( { siteId, siteSlug, from, ssh: 'true', host } )
							);
						}

						if ( shouldPickDestination ) {
							return navigate( paths.sitePickerPath( { from, platform, ssh: 'true', host } ) );
						}

						return navigate( paths.siteCreationPath( { from, platform, ssh: 'true', host } ) );
					}

					if (
						action !== 'skip_platform_identification' &&
						canUseStaticSiteImport( platform, from )
					) {
						return exitFlow(
							addQueryArgs(
								{
									from,
									platform,
									siteId: hasDestinationSite ? siteId : undefined,
									siteSlug: hasDestinationSite ? siteSlug : undefined,
								},
								`/setup/${ STATIC_SITE_IMPORT_FLOW }/${ STEPS.STATIC_SITE_IMPORT_READING.slug }`
							)
						);
					}

					if ( hasDestinationSite ) {
						if ( platform !== 'wordpress' || action === 'skip_platform_identification' ) {
							if ( isPlatformImportable( platform ) && from ) {
								return exitFlow( getFullImporterUrl( platform, siteSlug, from ) );
							}

							return exitFlow(
								paths.siteSetupImportListPath( {
									siteId,
									siteSlug,
									from: from || fromQueryParam,
									origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
									backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
								} )
							);
						}

						return navigate( paths.howToMigratePath( { from, siteSlug, siteId, platform, host } ) );
					}

					if ( shouldPickDestination ) {
						return navigate( paths.sitePickerPath( { from, platform, host } ) );
					}

					return navigate( paths.siteCreationPath( { from, platform, host } ) );
				}

				case STEPS.IMPORT_LIST.slug: {
					if ( ! config.isEnabled( 'migration/reprint-flow' ) ) {
						return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
					}
					const { platform } = providedDependencies;
					const from = fromQueryParam || '';
					const isAssistedMigration = platform === 'wordpress';
					const context = {
						from,
						platform,
						action: isAssistedMigration ? 'migrate' : 'import',
						how: isAssistedMigration ? HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME : '',
					};
					if ( hasSite( siteId, siteSlug ) ) {
						return isAssistedMigration
							? navigate( paths.howToMigratePath( { ...context, siteId, siteSlug } ) )
							: exitFlow( getFullImporterUrl( platform, siteSlug, from ) );
					}
					return navigate(
						userHasOtherWPComSites
							? paths.sitePickerPath( context )
							: paths.siteCreationPath( context )
					);
				}

				case STEPS.UNIFIED_PLANS.slug: {
					if ( ! isReprintSource ) {
						return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
					}
					if ( providedDependencies?.action === 'select-existing-site' ) {
						return navigate(
							paths.sitePickerPath( {
								siteId: '',
								siteSlug: '',
								from: fromQueryParam,
							} )
						);
					}
					const planCartItem = providedDependencies?.cartItems?.[ 0 ];
					if ( ! planCartItem ) {
						return;
					}
					const destinationId = siteId || savedHandoff?.siteId || 0;
					const destinationSlug = siteSlug || savedHandoff?.siteSlug || '';
					if ( hasSite( destinationId, destinationSlug ) ) {
						return configureAndContinue(
							destinationId,
							destinationSlug,
							fromQueryParam!,
							true,
							planCartItem.product_slug
						);
					}
					setPlanCartItem( planCartItem );
					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}
				case STEPS.PICK_SITE.slug: {
					switch ( providedDependencies?.action ) {
						case 'update-query': {
							const newQueryParams =
								( providedDependencies?.queryParams as { [ key: string ]: string } ) || {};

							Object.keys( newQueryParams ).forEach( ( key ) => {
								// Empty values override the current query params preserved by Stepper navigation.
								urlQueryParams.set( key, newQueryParams[ key ] || '' );
							} );

							const queryParams = Object.fromEntries( urlQueryParams );

							return replace(
								paths.sitePickerPath( {
									from: fromQueryParam,
									platform: platformQueryParam || 'unknown',
									...queryParams,
								} )
							);
						}
						case 'select-site': {
							const { ID: siteId, slug: siteSlug } = providedDependencies.site as SiteExcerptData;
							const selectedSite = providedDependencies.site as SiteExcerptData;
							const selectedSiteCanInstallPlugins = canInstallPlugins( selectedSite );
							const detectedHost = providedDependencies.host as string | undefined;
							const host = detectedHost || hostQueryParam;

							if ( isReprintSource && fromQueryParam && hasSite( siteId, siteSlug ) ) {
								return showWordpressDestination( siteId, siteSlug, fromQueryParam );
							}
							if ( isManualImport ) {
								return exitFlow(
									getFullImporterUrl( platformQueryParam, siteSlug, fromQueryParam || '' )
								);
							}

							// Check if this is an SSH migration flow
							// Either from ssh=true param OR from move-lp with supported hosting and English locale
							const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );
							const isHostingSupported = isHostingSupportedForSSHMigration( host );
							const shouldUseSSH =
								urlQueryParams.get( 'ssh' ) === 'true' ||
								( entryPoint === 'move-lp' &&
									isSSHMigrationAvailable &&
									isHostingSupported &&
									locale === 'en' );

							if ( shouldUseSSH ) {
								if ( selectedSiteCanInstallPlugins ) {
									return navigate(
										paths.sshVerificationPath( {
											siteId,
											siteSlug,
											from: fromQueryParam,
											host,
										} )
									);
								}
								return navigate(
									paths.upgradePlanPath( {
										siteId,
										siteSlug,
										from: fromQueryParam,
										ssh: 'true',
										host,
									} )
								);
							}

							if ( 'migrate' === actionQueryParam ) {
								return navigate(
									paths.howToMigratePath( {
										siteSlug,
										siteId,
										from: fromQueryParam,
									} )
								);
							}

							if ( platformQueryParam !== 'wordpress' ) {
								if ( isPlatformImportable( platformQueryParam ) && fromQueryParam ) {
									return exitFlow(
										getFullImporterUrl( platformQueryParam, siteSlug, fromQueryParam )
									);
								}

								return exitFlow(
									paths.siteSetupImportListPath( {
										from: fromQueryParam,
										siteSlug,
										siteId,
										backToFlow: `/${ flowPath }/${ STEPS.PICK_SITE.slug }`,
										origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
									} )
								);
							}

							return navigate(
								paths.howToMigratePath( {
									siteSlug,
									siteId,
									from: fromQueryParam,
								} )
							);
						}
						case 'create-site': {
							if ( isReprintSource && fromQueryParam ) {
								return navigate( paths.plansPath( { from: fromQueryParam } ) );
							}
							const detectedHost = providedDependencies.host as string | undefined;
							const host = detectedHost || hostQueryParam;

							// Check if SSH migration should be enabled
							const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );
							const isHostingSupported = isHostingSupportedForSSHMigration( host );
							const shouldUseSSH =
								urlQueryParams.get( 'ssh' ) === 'true' ||
								( entryPoint === 'move-lp' &&
									isSSHMigrationAvailable &&
									isHostingSupported &&
									locale === 'en' );

							const queryParams: {
								from: string | null;
								platform: ImporterPlatform;
								ssh?: string;
								host?: string;
							} = {
								from: fromQueryParam,
								platform: platformQueryParam,
								host,
							};

							// Add SSH params if applicable
							if ( shouldUseSSH ) {
								queryParams.ssh = 'true';
							}

							// The picker auto-submits when the user has no sites. Replace so Back doesn't return to it.
							return navigate( paths.siteCreationPath( queryParams ), undefined, siteCount === 0 );
						}
					}
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					if ( recoveryPlansPath ) {
						if ( handoffStarted.current ) {
							return;
						}
						return replace( recoveryPlansPath );
					}
					return replace(
						paths.processingPath( {
							from: fromQueryParam,
							platform: platformQueryParam,
							action: actionQueryParam,
							host: hostQueryParam,
						} )
					);
				}

				case STEPS.PROCESSING.slug: {
					if ( recoveryPlansPath ) {
						if ( handoffStarted.current ) {
							return;
						}
						return replace( recoveryPlansPath );
					}
					const { siteCreated, siteId, siteSlug, processingResult } = providedDependencies as {
						siteCreated: boolean;
						siteId: number;
						siteSlug: string;
						processingResult?: ProcessingResult;
					};

					if ( ! siteCreated ) {
						// A reload of the processing step drops the pending action and submits
						// NO_ACTION, which says nothing about whether the site exists.
						return navigate( STEPS.ERROR.slug, {
							message: 'Site not created',
							errorReason: getProcessingErrorReason( processingResult, 'site_not_created' ),
						} );
					}

					recordSignupComplete( { siteId } );
					if ( isManualImport ) {
						return exitFlow(
							getFullImporterUrl( platformQueryParam, siteSlug, fromQueryParam || '' ),
							true
						);
					}

					if ( isReprintSource && fromQueryParam ) {
						return configureAndContinue( siteId, siteSlug, fromQueryParam, true );
					}

					// Check if this is an SSH migration flow (ssh=true is already set in URL from PICK_SITE)
					if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
						return replace(
							paths.upgradePlanPath( {
								siteId,
								from: fromQueryParam,
								siteSlug,
								ssh: 'true',
								host: hostQueryParam,
							} )
						);
					}

					//NOTE: There are links pointing to this step with the action=migrate query param, so we need to ignore the platform
					if ( actionQueryParam === 'migrate' ) {
						if (
							urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME &&
							! (
								config.isEnabled( 'migration/reprint-flow' ) && platformQueryParam === 'wordpress'
							)
						) {
							return replace(
								paths.upgradePlanPath( {
									siteId,
									from: fromQueryParam,
									siteSlug,
									how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
								} )
							);
						}

						return replace(
							paths.howToMigratePath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
							} )
						);
					}

					if (
						platformQueryParam &&
						platformQueryParam !== 'wordpress' &&
						isPlatformImportable( platformQueryParam ) &&
						fromQueryParam
					) {
						return exitFlow(
							getFullImporterUrl( platformQueryParam, siteSlug, fromQueryParam ),
							true
						);
					}

					if ( ! fromQueryParam || platformQueryParam !== 'wordpress' ) {
						// If we get to this point without a fromQueryParam then we are coming from a direct
						// pick your current platform link. That's why we navigate to the importList step.
						return exitFlow(
							paths.siteSetupImportListPath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
								backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
							} ),
							true
						);
					}

					return replace(
						paths.howToMigratePath( {
							from: fromQueryParam,
							siteSlug,
							siteId,
						} )
					);
				}

				case STEPS.ERROR.slug: {
					if ( providedDependencies?.action === 'retry' && savedHandoff ) {
						return configureAndContinue(
							savedHandoff.siteId,
							savedHandoff.siteSlug,
							savedHandoff.from,
							savedHandoff.shouldGoToCheckout,
							savedHandoff.plan
						);
					}
					return;
				}

				case STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug: {
					if ( providedDependencies?.destination === 'import' ) {
						return exitFlow(
							paths.siteSetupImportWordpressPath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug }`,
							} )
						);
					}
					if (
						config.isEnabled( 'migration/reprint-flow' ) &&
						urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME &&
						providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF
					) {
						return navigate( paths.identifyPath( { from: fromQueryParam, how: '' } ) );
					}

					if (
						config.isEnabled( 'migration/reprint-flow' ) &&
						platformQueryParam === 'wordpress' &&
						providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_MYSELF &&
						fromQueryParam &&
						hasSite( siteId, siteSlug )
					) {
						return showWordpressDestination( siteId, siteSlug, fromQueryParam );
					}

					// Take the user to the upgrade plan step.
					if ( providedDependencies?.destination === 'upgrade' ) {
						return replace(
							paths.upgradePlanPath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								destination: providedDependencies?.destination,
								how: providedDependencies?.how as string,
							} )
						);
					}

					if ( providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}

					return navigate( paths.instructionsPath( { siteId, siteSlug, from: fromQueryParam } ) );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( providedDependencies?.goToCheckout ) {
						let redirectAfterCheckout: string = STEPS.SITE_MIGRATION_INSTRUCTIONS.slug;
						if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
							// Redirect to verification first to obtain transferId before share-access
							redirectAfterCheckout = STEPS.SITE_MIGRATION_SSH_VERIFICATION.slug;
						} else if ( urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
							redirectAfterCheckout = STEPS.SITE_MIGRATION_CREDENTIALS.slug;
						}
						const destination = addQueryArgs(
							{
								siteSlug,
								from: fromQueryParam,
								siteId,
								host: hostQueryParam,
							},
							`/setup/${ flowPath }/${ redirectAfterCheckout }`
						);
						goToCheckout( {
							flowName: flowPath,
							stepName: STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug,
							siteSlug: siteSlug,
							destination: destination,
							from: fromQueryParam ?? undefined,
							plan: providedDependencies.plan as string,
							historyBack: true,
						} );
						return;
					}

					if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
						return navigate(
							paths.sshVerificationPath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								host: hostQueryParam,
							} )
						);
					}

					if ( urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}

					return navigate( paths.instructionsPath( { siteId, siteSlug, from: fromQueryParam } ) );
				}

				case STEPS.SITE_MIGRATION_SSH_VERIFICATION.slug: {
					const { allowSiteMigration, transferId } = providedDependencies as {
						verified: boolean;
						transferId?: number;
						allowSiteMigration?: boolean;
					};

					// If site migration is not allowed, redirect to fallback credentials flow
					if ( allowSiteMigration === false ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}

					// Otherwise proceed to SSH share access
					return navigate(
						paths.sshShareAccessPath( {
							siteId,
							siteSlug,
							transferId,
							from: fromQueryParam,
							host: hostQueryParam,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_INSTRUCTIONS.slug: {
					// User decided to ask for an assisted migration - try to collect credentials.
					if ( providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}
					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_CREDENTIALS.slug: {
					const { action, from, authorizationUrl, platform, host } = providedDependencies;

					if ( action === 'skip' ) {
						return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
					}

					if ( action === 'redirect-to-ssh' ) {
						// Redirect to SSH verification step
						return navigate(
							paths.sshVerificationPath( {
								siteId,
								siteSlug,
								from: from || fromQueryParam,
								host,
							} )
						);
					}

					if ( action === 'already-wpcom' ) {
						return navigate(
							paths.alreadyWpcomPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
							} )
						);
					}

					if ( action === 'site-is-not-using-wordpress' ) {
						return navigate(
							paths.otherPlatformDetectedImportPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
								platform,
							} )
						);
					}

					if ( action === 'application-passwords-approval' ) {
						return navigate(
							paths.applicationPasswordAuthorizationPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
								authorizationUrl,
							} )
						);
					}

					if ( action === 'credentials-required' ) {
						return navigate(
							paths.fallbackCredentialsPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
							} )
						);
					}

					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug: {
					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_ALREADY_WPCOM.slug: {
					return navigate(
						paths.supportInstructionsPath( {
							siteId,
							from: fromQueryParam,
							siteSlug,
							preventTicketCreation: true,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug: {
					if ( providedDependencies?.action === 'import' ) {
						return goToImporter( {
							platform: providedDependencies.platform as ImporterPlatform,
							siteId: siteId!.toString(),
							siteSlug,
							backToFlow: `${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug }`,
							from: fromQueryParam,
							ref: SITE_MIGRATION_FLOW,
						} );
					}

					return navigate(
						paths.supportInstructionsPath( { siteId, from: fromQueryParam, siteSlug } )
					);
				}

				case STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug: {
					const { action, authorizationUrl } = providedDependencies;

					if ( action === 'authorization' ) {
						if ( isAuthorizationUrlAllowed( authorizationUrl, fromQueryParam ) ) {
							const currentUrl = window.location.href;
							const successUrl = encodeURIComponent( currentUrl );
							return exitFlow( authorizationUrl + `&success_url=${ successUrl }` );
						}

						return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
					}

					if ( action === 'fallback-credentials' ) {
						return navigate(
							paths.fallbackCredentialsPath( {
								siteId,
								siteSlug,
								authorizationUrl,
								backTo: STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug,
								from: fromQueryParam,
							} )
						);
					}

					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_SSH_SHARE_ACCESS.slug: {
					const { destination, from, authorizationUrl, platform } = providedDependencies as {
						destination?:
							| 'migration-started'
							| 'migration-completed'
							| 'no-ssh-access'
							| 'back-to-verification'
							| 'do-it-for-me'
							| 'application-passwords-approval'
							| 'fallback-credentials'
							| 'already-wpcom'
							| 'site-is-not-using-wordpress';
						from?: string;
						authorizationUrl?: string;
						platform?: ImporterPlatform;
					};

					// Missing transferId, redirect back to verification
					if ( destination === 'back-to-verification' ) {
						return navigate(
							paths.sshVerificationPath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								host: hostQueryParam,
							} )
						);
					}

					// User doesn't have SSH access, redirect to credentials flow
					if ( destination === 'no-ssh-access' ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}

					// Application passwords are enabled, go to authorization step
					if ( destination === 'application-passwords-approval' ) {
						return navigate(
							paths.applicationPasswordAuthorizationPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
								authorizationUrl,
							} )
						);
					}

					// Application passwords are disabled, go to fallback credentials
					if ( destination === 'fallback-credentials' ) {
						return navigate(
							paths.fallbackCredentialsPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
							} )
						);
					}

					// Site is already on wpcom
					if ( destination === 'already-wpcom' ) {
						return navigate(
							paths.alreadyWpcomPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
							} )
						);
					}

					// Site is not using WordPress
					if ( destination === 'site-is-not-using-wordpress' ) {
						return navigate(
							paths.otherPlatformDetectedImportPath( {
								siteId,
								from: from || fromQueryParam,
								siteSlug,
								platform,
							} )
						);
					}

					// Migration completed during polling, go to overview
					if ( destination === 'migration-completed' ) {
						return exitFlow(
							paths.dashboardSiteSSHMigration( { 'ssh-migration': 'completed' }, { siteSlug } )
						);
					}

					if ( destination === 'do-it-for-me' ) {
						return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
					}

					return navigate( paths.sshInProgressPath( { siteId, siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_SSH_IN_PROGRESS.slug: {
					const { action } = providedDependencies as {
						action: 'migration-completed' | 'migration-failed' | 'preflight' | 'unexpected-status';
					};

					switch ( action ) {
						case 'migration-completed':
							return exitFlow(
								paths.dashboardSiteSSHMigration( { 'ssh-migration': 'completed' }, { siteSlug } )
							);
						case 'migration-failed':
							return exitFlow(
								paths.dashboardSiteSSHMigration( { 'ssh-migration': 'failed' }, { siteSlug } )
							);
						default:
							return navigate( paths.sshShareAccessPath( { siteId, siteSlug } ) );
					}
				}
			}
		};

		let goBack;
		if (
			config.isEnabled( 'migration/reprint-flow' ) &&
			window.history.length > 1 &&
			( currentStep === STEPS.SITE_MIGRATION_IDENTIFY.slug ||
				currentStep === STEPS.IMPORT_LIST.slug ||
				currentStep === STEPS.SITE_MIGRATION_CHECK.slug ||
				( ( isManualImport ||
					urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) &&
					( currentStep === STEPS.PICK_SITE.slug ||
						currentStep === STEPS.SITE_CREATION_STEP.slug ) ) ||
				( isReprintSource &&
					( currentStep === STEPS.UNIFIED_PLANS.slug || currentStep === STEPS.PICK_SITE.slug ) ) )
		) {
			goBack = () => navigateHistory( -1 );
		} else if ( currentStep === STEPS.IMPORT_LIST.slug ) {
			goBack = () => replace( STEPS.SITE_MIGRATION_IDENTIFY.slug );
		} else if (
			isReprintSource &&
			fromQueryParam &&
			( currentStep === STEPS.UNIFIED_PLANS.slug || currentStep === STEPS.PICK_SITE.slug )
		) {
			goBack = () =>
				replace(
					currentStep === STEPS.PICK_SITE.slug
						? paths.plansPath( { from: fromQueryParam } )
						: paths.siteCheckPath( { from: fromQueryParam } )
				);
		}
		return { submit, exitFlow, goBack };
	},
};

export default siteMigration;
