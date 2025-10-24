import config from '@automattic/calypso-config';
import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { SiteExcerptData } from '@automattic/sites';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	isPlatformImportable,
	getFullImporterUrl,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { type SiteMigrationIdentifyAction } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-identify';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { goToImporter } from 'calypso/landing/stepper/declarative-flow/migration/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import * as paths from './paths';
import type {
	AssertConditionResult,
	FlowV2,
	NavigateV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';

const BASE_STEPS = [
	STEPS.SITE_MIGRATION_IDENTIFY,
	STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
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
	STEPS.PICK_SITE,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
];

function initialize() {
	return stepsWithRequiredLogin( BASE_STEPS );
}

const hasSite = ( siteId: number, siteSlug: string ) => {
	return siteId && siteId !== 0 && siteSlug && siteSlug !== '';
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

	useStepNavigation( currentStep, navigate: NavigateV2< typeof BASE_STEPS > ) {
		const flowName = this.name;
		const { siteId, siteSlug, site } = useSiteData();
		const variantSlug = this.variantSlug;
		const flowPath = variantSlug ?? flowName;
		const siteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const actionQueryParam = urlQueryParams.get( 'action' );
		const platformQueryParam = ( urlQueryParams.get( 'platform' ) ||
			'unknown' ) as ImporterPlatform;
		const { get, sessionId } = useFlowState();
		const userHasOtherWPComSites = siteCount && siteCount > 1;
		const entryPoint = get( 'flow' )?.entryPoint;
		const canInstallPlugins = site?.plan?.features?.active.includes( 'install-plugins' ) ?? false;
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
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: ImporterPlatform;
						action: SiteMigrationIdentifyAction;
					};
					const hasDestinationSite = hasSite( siteId, siteSlug );
					// TODO: Remove the call and use a actual check for the hosting
					const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );

					if ( isSSHMigrationAvailable ) {
						if ( hasDestinationSite && canInstallPlugins ) {
							return navigate( paths.sshVerificationPath( { siteId, siteSlug } ) );
						}

						if ( hasDestinationSite ) {
							return navigate( paths.upgradePlanPath( { siteId, siteSlug, from, ssh: 'true' } ) );
						}

						if ( userHasOtherWPComSites ) {
							return navigate( paths.sitePickerPath( { from, platform, ssh: 'true' } ) );
						}

						return navigate( paths.siteCreationPath( { from, platform, ssh: 'true' } ) );
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

						return navigate( paths.importOrMigratePath( { from, siteSlug, siteId } ) );
					}

					if ( userHasOtherWPComSites ) {
						return navigate( paths.sitePickerPath( { from, platform } ) );
					}

					return navigate( paths.siteCreationPath( { from, platform } ) );
				}

				case STEPS.PICK_SITE.slug: {
					switch ( providedDependencies?.action ) {
						case 'update-query': {
							const newQueryParams =
								( providedDependencies?.queryParams as { [ key: string ]: string } ) || {};

							Object.keys( newQueryParams ).forEach( ( key ) => {
								newQueryParams[ key ]
									? urlQueryParams.set( key, newQueryParams[ key ] )
									: urlQueryParams.delete( key );
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
							const selectedSiteCanInstallPlugins =
								selectedSite?.plan?.features?.active.includes( 'install-plugins' ) ?? false;

							// Check if this is an SSH migration flow
							if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
								if ( selectedSiteCanInstallPlugins ) {
									return navigate( paths.sshVerificationPath( { siteId, siteSlug } ) );
								}
								return navigate(
									paths.upgradePlanPath( { siteId, siteSlug, from: fromQueryParam, ssh: 'true' } )
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
										origin: '',
									} )
								);
							}

							return navigate( paths.importOrMigratePath( { siteSlug, siteId } ) );
						}
						case 'create-site': {
							const queryParams: {
								from: string | null;
								platform: ImporterPlatform;
								ssh?: string;
							} = {
								from: fromQueryParam,
								platform: platformQueryParam,
							};
							if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
								queryParams.ssh = 'true';
							}
							return navigate( paths.siteCreationPath( queryParams ) );
						}
					}
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return replace(
						paths.processingPath( {
							from: fromQueryParam,
							platform: platformQueryParam,
							action: actionQueryParam,
						} )
					);
				}

				case STEPS.PROCESSING.slug: {
					const { siteCreated, siteId, siteSlug } = providedDependencies as {
						siteCreated: boolean;
						siteId: number;
						siteSlug: string;
					};

					if ( ! siteCreated ) {
						return navigate( STEPS.ERROR.slug, {
							message: 'Site not created',
						} );
					}

					recordSignupComplete( { siteId } );

					// Check if this is an SSH migration flow
					if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
						return replace(
							paths.upgradePlanPath( {
								siteId,
								from: fromQueryParam,
								siteSlug,
								ssh: 'true',
							} )
						);
					}

					//NOTE: There are links pointing to this step with the action=migrate query param, so we need to ignore the platform
					if ( actionQueryParam === 'migrate' ) {
						if ( urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
							return replace(
								paths.upgradePlanPath( {
									siteId,
									from: fromQueryParam,
									siteSlug,
									how: HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME,
								} )
							);
						}

						return replace( paths.howToMigratePath( { siteId, siteSlug, from: fromQueryParam } ) );
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

					return replace( paths.importOrMigratePath( { from: fromQueryParam, siteSlug, siteId } ) );
				}

				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					const { destination } = providedDependencies as {
						destination: 'import' | 'migrate';
					};
					// Switch to the normal Import flow.
					if ( destination === 'import' ) {
						if ( entryPoint === 'calypso-importer' ) {
							return exitFlow(
								paths.calypsoImporterPath(
									{ engine: 'wordpress', ref: 'site-migration' },
									{ siteSlug }
								)
							);
						}

						return exitFlow(
							paths.siteSetupImportWordpressPath( {
								siteId,
								siteSlug,
								from: fromQueryParam ?? '',
								backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }`,
							} )
						);
					}

					return navigate( paths.howToMigratePath( { siteId, siteSlug, from: fromQueryParam } ) );
				}

				case STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug: {
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
							redirectAfterCheckout = STEPS.SITE_MIGRATION_SSH_SHARE_ACCESS.slug;
						} else if ( urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
							redirectAfterCheckout = STEPS.SITE_MIGRATION_CREDENTIALS.slug;
						}
						const destination = addQueryArgs(
							{
								siteSlug,
								from: fromQueryParam,
								siteId,
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
							extraQueryParams:
								providedDependencies?.sendIntentWhenCreatingTrial &&
								providedDependencies?.plan === PLAN_MIGRATION_TRIAL_MONTHLY
									? { hosting_intent: HOSTING_INTENT_MIGRATE }
									: {},
						} );
						return;
					}

					if ( urlQueryParams.get( 'ssh' ) === 'true' ) {
						return navigate( paths.sshVerificationPath( { siteId, siteSlug } ) );
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
					return navigate( paths.sshShareAccessPath( { siteId, siteSlug, transferId } ) );
				}

				case STEPS.SITE_MIGRATION_INSTRUCTIONS.slug: {
					// User decided to ask for an assisted migration - try to collect credentials.
					if ( providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}
					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_CREDENTIALS.slug: {
					const { action, from, authorizationUrl, platform } = providedDependencies;

					if ( action === 'skip' ) {
						return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
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
						const currentUrl = window.location.href;
						const successUrl = encodeURIComponent( currentUrl );
						return exitFlow( authorizationUrl + `&success_url=${ successUrl }` );
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
					const { destination } = providedDependencies as {
						destination?: 'migration-started' | 'no-ssh-access' | 'back-to-verification';
					};

					// Missing transferId, redirect back to verification
					if ( destination === 'back-to-verification' ) {
						return navigate( paths.sshVerificationPath( { siteId, siteSlug } ) );
					}

					// User doesn't have SSH access, redirect to credentials flow
					if ( destination === 'no-ssh-access' ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
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

		return { submit, exitFlow };
	},
};

export default siteMigration;
