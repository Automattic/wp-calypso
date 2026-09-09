import config from '@automattic/calypso-config';
import { Onboard } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { SiteExcerptData } from '@automattic/sites';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	isPlatformImportable,
	getFullImporterUrl,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { type SiteMigrationIdentifyAction } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-identify';
import { isHostingSupportedForSSHMigration } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-ssh-share-access/utils/hosting-provider-validation';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { goToImporter } from 'calypso/landing/stepper/declarative-flow/migration/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useRecordSignupComplete } from 'calypso/landing/stepper/hooks/use-record-signup-complete';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import * as paths from './paths';
import type { OnboardActions } from '@automattic/data-stores';
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
	// The non-WordPress wizard: enter a URL, read the site, review, pick a plan,
	// pay, import. The scan and preview screens are still parked; the choose,
	// domain and SEO screens were removed when this order was settled.
	STEPS.SITE_MIGRATION_CAPTURE,
	STEPS.UNIFIED_PLANS,
	STEPS.SITE_MIGRATION_REVIEW,
	STEPS.SITE_MIGRATION_IMPORT_PROGRESS,
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

/**
 * The single gate for the non-WordPress wizard. Every fork that used to drop the user
 * into the content importer consults this, so the branches cannot drift apart.
 */
const canUseNonWordPressMigration = ( platform: ImporterPlatform, from?: string | null ) =>
	config.isEnabled( 'migration/non-wordpress-source' ) &&
	platform !== 'wordpress' &&
	Boolean( from );

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
	useStepsProps() {
		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				// The wizard always builds a new site, so this is always signup framing.
				isInSignup: true,
				wrapperProps: {
					goBack: () => window.history.back(),
				},
			},
		};
	},
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
		const locale = useLocale();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const actionQueryParam = urlQueryParams.get( 'action' );
		const platformQueryParam = ( urlQueryParams.get( 'platform' ) ||
			'unknown' ) as ImporterPlatform;
		const hostQueryParam = urlQueryParams.get( 'host' ) || undefined;
		// Set when the site was created off the back of the wizard, so the step
		// after site creation is the import rather than the start of the wizard.
		const isWizardComplete = urlQueryParams.get( 'wizardComplete' ) === 'true';
		const { get, set, sessionId } = useFlowState();
		// The import session the capture step started, and the archive hash the user
		// reviewed. Both have to reach the import step, which is on the far side of
		// checkout, so they ride the URL rather than flow state.
		const importSessionIdQueryParam = urlQueryParams.get( 'importSessionId' );
		const archiveHashQueryParam = urlQueryParams.get( 'archiveHash' );
		const { setPlanCartItem } = useDispatch( ONBOARD_STORE ) as OnboardActions;
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

		/**
		 * Today's exit into the content-only importer: the dedicated importer when the platform has
		 * one and a source URL is known, and the importer list otherwise.
		 */
		const exitToContentImporter = ( {
			platform,
			from,
			siteSlug: destinationSiteSlug,
			siteId: destinationSiteId,
			origin,
			backToStep,
			shouldReplace = false,
		}: {
			platform: ImporterPlatform;
			from: string | null;
			siteSlug: string;
			siteId?: number | string;
			origin: string;
			backToStep: string;
			shouldReplace?: boolean;
		} ) => {
			if ( isPlatformImportable( platform ) && from ) {
				return exitFlow( getFullImporterUrl( platform, destinationSiteSlug, from ), shouldReplace );
			}

			return exitFlow(
				paths.siteSetupImportListPath( {
					siteId: destinationSiteId,
					siteSlug: destinationSiteSlug,
					from,
					origin,
					backToFlow: `/${ flowPath }/${ backToStep }`,
				} ),
				shouldReplace
			);
		};

		const wizardQueryParams = {
			from: fromQueryParam,
			platform: platformQueryParam,
		};

		/** What the import step needs, carried across checkout's external redirect. */
		const importSessionQueryParams = (
			overrides: {
				importSessionId?: string | null;
				archiveHash?: string | null;
			} = {}
		) => ( {
			importSessionId: overrides.importSessionId ?? importSessionIdQueryParam,
			archiveHash: overrides.archiveHash ?? archiveHashQueryParam,
		} );

		const goToMigrationCheckout = ( {
			siteId: destinationSiteId,
			siteSlug: destinationSiteSlug,
			importSessionId,
			archiveHash,
		}: {
			siteId?: number | string;
			siteSlug: string;
			importSessionId?: string | null;
			archiveHash?: string | null;
		} ) => {
			const destination = addQueryArgs(
				{
					siteSlug: destinationSiteSlug,
					siteId: destinationSiteId,
					from: fromQueryParam,
					// Checkout leaves Calypso entirely, so anything not in this URL is gone
					// by the time the user comes back.
					...importSessionQueryParams( { importSessionId, archiveHash } ),
				},
				`/setup/${ flowPath }/${ STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug }`
			);

			return goToCheckout( {
				flowName: flowPath,
				stepName: STEPS.SITE_MIGRATION_REVIEW.slug,
				siteSlug: destinationSiteSlug,
				destination,
				from: fromQueryParam ?? undefined,
				plan: get( 'plans' )?.cartItems?.[ 0 ]?.product_slug,
				historyBack: true,
			} );
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
					const { from, platform, action, host } = providedDependencies as {
						from: string;
						platform: ImporterPlatform;
						action: SiteMigrationIdentifyAction;
						host?: string;
					};
					const hasDestinationSite = hasSite( siteId, siteSlug );
					const isSSHMigrationAvailable = config.isEnabled( 'migration/ssh-migration' );

					// Check if hosting provider is supported for SSH migration
					const isHostingSupported = isHostingSupportedForSSHMigration( host );

					// Track hosting provider detection
					recordTracksEvent( 'calypso_site_migration_hosting_detected', {
						hosting_provider: host || 'unknown',
						is_ssh_supported: isHostingSupported,
						ssh_feature_enabled: isSSHMigrationAvailable,
						is_english_locale: locale === 'en',
						redirected_to_ssh: isSSHMigrationAvailable && isHostingSupported && locale === 'en',
					} );

					// SSH migration is ONLY available if feature flag is enabled AND hosting is supported AND locale is English
					const canUseSSHMigration =
						isSSHMigrationAvailable && isHostingSupported && locale === 'en';

					if ( canUseSSHMigration ) {
						if ( hasDestinationSite && canInstallPlugins ) {
							return navigate( paths.sshVerificationPath( { siteId, siteSlug, from, host } ) );
						}

						if ( hasDestinationSite ) {
							return navigate(
								paths.upgradePlanPath( { siteId, siteSlug, from, ssh: 'true', host } )
							);
						}

						if ( userHasOtherWPComSites ) {
							return navigate( paths.sitePickerPath( { from, platform, ssh: 'true', host } ) );
						}

						return navigate( paths.siteCreationPath( { from, platform, ssh: 'true', host } ) );
					}

					// Picking a platform from the list keeps its straight-to-importer behaviour.
					if (
						canUseNonWordPressMigration( platform, from ) &&
						action !== 'skip_platform_identification'
					) {
						set( STEPS.SITE_MIGRATION_IDENTIFY.slug, providedDependencies );
						return navigate( paths.capturePath( { from, platform } ) );
					}

					if ( hasDestinationSite ) {
						if ( platform !== 'wordpress' || action === 'skip_platform_identification' ) {
							return exitToContentImporter( {
								platform,
								from: from || fromQueryParam,
								siteSlug,
								siteId,
								origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
								backToStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
							} );
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
								if ( newQueryParams[ key ] ) {
									urlQueryParams.set( key, newQueryParams[ key ] );
								} else {
									urlQueryParams.delete( key );
								}
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
							const detectedHost = providedDependencies.host as string | undefined;
							const host = detectedHost || hostQueryParam;

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

							if ( canUseNonWordPressMigration( platformQueryParam, fromQueryParam ) ) {
								return navigate(
									paths.capturePath( {
										from: fromQueryParam,
										platform: platformQueryParam,
										siteId,
										siteSlug,
									} )
								);
							}

							if ( platformQueryParam !== 'wordpress' ) {
								return exitToContentImporter( {
									platform: platformQueryParam,
									from: fromQueryParam,
									siteSlug,
									siteId,
									origin: '',
									backToStep: STEPS.PICK_SITE.slug,
								} );
							}

							return navigate( paths.importOrMigratePath( { siteSlug, siteId } ) );
						}
						case 'create-site': {
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
							};

							// Add SSH params if applicable
							if ( shouldUseSSH ) {
								queryParams.ssh = 'true';
								if ( host ) {
									queryParams.host = host;
								}
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
							host: hostQueryParam,
							...( isWizardComplete ? { wizardComplete: 'true' } : {} ),
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

					if ( canUseNonWordPressMigration( platformQueryParam, fromQueryParam ) ) {
						// The site was created off the back of the plans step, so the plan the user
						// picked is already in the cart and checkout is the next stop.
						if ( ( providedDependencies as { goToCheckout?: boolean } ).goToCheckout ) {
							return goToMigrationCheckout( { siteId, siteSlug } );
						}

						if ( isWizardComplete ) {
							return replace(
								paths.importProgressPath( {
									siteId,
									siteSlug,
									from: fromQueryParam,
									...importSessionQueryParams(),
								} )
							);
						}

						// The site was created before the wizard ran, so start the wizard now.
						return replace(
							paths.capturePath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								platform: platformQueryParam,
							} )
						);
					}

					if ( ! fromQueryParam || platformQueryParam !== 'wordpress' ) {
						// If we get to this point without a fromQueryParam then we are coming from a direct
						// pick your current platform link. That's why we navigate to the importList step.
						return exitToContentImporter( {
							platform: platformQueryParam,
							from: fromQueryParam,
							siteSlug,
							siteId,
							origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
							backToStep: STEPS.SITE_MIGRATION_IDENTIFY.slug,
							shouldReplace: true,
						} );
					}

					return replace( paths.importOrMigratePath( { from: fromQueryParam, siteSlug, siteId } ) );
				}

				case STEPS.SITE_MIGRATION_CAPTURE.slug: {
					set( STEPS.SITE_MIGRATION_CAPTURE.slug, providedDependencies );

					const { sessionId: importSessionId } = providedDependencies as { sessionId: string };

					// The read keeps running in the background; Review picks the same session up.
					return navigate( paths.reviewPath( { ...wizardQueryParams, importSessionId } ) );
				}

				case STEPS.SITE_MIGRATION_REVIEW.slug: {
					set( STEPS.SITE_MIGRATION_REVIEW.slug, providedDependencies );

					const { sessionId: importSessionId, archiveHash } = providedDependencies as {
						action: 'migrate';
						sessionId?: string;
						archiveHash?: string;
					};

					// The wizard always builds a new site, so there is always a plan to pick.
					return navigate(
						paths.plansPath( {
							...wizardQueryParams,
							...importSessionQueryParams( { importSessionId, archiveHash } ),
						} )
					);
				}

				case STEPS.UNIFIED_PLANS.slug: {
					const planCartItem = providedDependencies?.cartItems?.[ 0 ];

					if ( planCartItem ) {
						setPlanCartItem( planCartItem );
					}

					// `useCreateSite` reads the plan back out of flow state, so persisting this is
					// what puts the plan in the cart when the site is created just below. A free
					// plan leaves the cart empty, and the processing step then skips checkout.
					set( STEPS.UNIFIED_PLANS.slug, providedDependencies );

					return navigate(
						paths.siteCreationPath( {
							from: fromQueryParam,
							platform: platformQueryParam,
							wizardComplete: 'true',
							...importSessionQueryParams(),
						} )
					);
				}

				case STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug: {
					set( STEPS.SITE_MIGRATION_IMPORT_PROGRESS.slug, providedDependencies );

					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
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

		return { submit, exitFlow };
	},
};

export default siteMigration;
