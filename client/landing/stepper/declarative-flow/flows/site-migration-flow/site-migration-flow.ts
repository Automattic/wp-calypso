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
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getCurrentUserSiteCount } from 'calypso/state/current-user/selectors';
import { getSiteAdminUrl, getSiteWooCommerceUrl } from 'calypso/state/sites/selectors';
import * as paths from './paths';
import type {
	AssertConditionResult,
	FlowV2,
	ProvidedDependencies,
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
	STEPS.PICK_SITE,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
];

const hasSite = ( siteId: number, siteSlug: string ) => {
	return siteId && siteId !== 0 && siteSlug && siteSlug !== '';
};

const siteMigration: FlowV2 = {
	name: SITE_MIGRATION_FLOW,
	isSignupFlow: false,
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,

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

	initialize() {
		return stepsWithRequiredLogin( BASE_STEPS );
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

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { siteId, siteSlug } = useSiteData();
		const variantSlug = this.variantSlug;
		const flowPath = variantSlug ?? flowName;
		const siteCount = useSelector( ( state ) => getCurrentUserSiteCount( state ) );
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const actionQueryParam = urlQueryParams.get( 'action' );
		const platformQueryParam = ( urlQueryParams.get( 'platform' ) ||
			'unknown' ) as ImporterPlatform;
		const { get, sessionId } = useFlowState();
		const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
		const siteWooCommerceUrl = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) );
		const userHasOtherWPComSites = siteCount && siteCount > 1;
		const entryPoint = get( 'flow' )?.entryPoint;
		const exitFlow = ( to: string ) => {
			return window.location.assign( addQueryArgs( { sessionId }, to ) );
		};

		// Call triggerGuidesForStep for the current step
		useEffect( () => {
			triggerGuidesForStep( flowName, currentStep, siteId );
		}, [ flowName, currentStep, siteId ] );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: ImporterPlatform;
						action: SiteMigrationIdentifyAction;
					};
					const hasDestinationSite = hasSite( siteId, siteSlug );
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

							return navigate(
								paths.sitePickerPath( {
									from: fromQueryParam,
									platform: platformQueryParam || 'unknown',
									...queryParams,
								} )
							);
						}
						case 'select-site': {
							const { ID: siteId, slug: siteSlug } = providedDependencies.site as SiteExcerptData;

							if ( 'migrate' === actionQueryParam ) {
								return navigate(
									paths.howToMigratePath( {
										siteSlug,
										siteId,
										from: fromQueryParam,
									} )
								);
							}

							if ( platformQueryParam !== 'unknown' && platformQueryParam !== 'wordpress' ) {
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
						case 'create-site':
							return navigate(
								paths.siteCreationPath( { from: fromQueryParam, platform: platformQueryParam } )
							);
					}
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return navigate(
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

					//NOTE: There are links pointing to this step with the action=migrate query param, so we need to ignore the platform
					if ( actionQueryParam === 'migrate' ) {
						return navigate( paths.howToMigratePath( { siteId, siteSlug, from: fromQueryParam } ) );
					}

					if (
						platformQueryParam &&
						platformQueryParam !== 'wordpress' &&
						isPlatformImportable( platformQueryParam ) &&
						fromQueryParam
					) {
						return exitFlow( getFullImporterUrl( platformQueryParam, siteSlug, fromQueryParam ) );
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
							} )
						);
					}

					return navigate(
						paths.importOrMigratePath( { from: fromQueryParam, siteSlug, siteId } )
					);
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
						return navigate(
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

						if ( urlQueryParams.get( 'how' ) === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
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
							cancelDestination: `/setup/${ flowPath }/${
								STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
							}?${ urlQueryParams.toString() }`,
							extraQueryParams:
								providedDependencies?.sendIntentWhenCreatingTrial &&
								providedDependencies?.plan === PLAN_MIGRATION_TRIAL_MONTHLY
									? { hosting_intent: HOSTING_INTENT_MIGRATE }
									: {},
						} );
						return;
					}
				}

				case STEPS.SITE_MIGRATION_INSTRUCTIONS.slug: {
					// User decided to ask for an assisted migration - try to collect credentials.
					if ( providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}
					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}

				case STEPS.SITE_MIGRATION_CREDENTIALS.slug: {
					const { action, from, authorizationUrl, platform } = providedDependencies as {
						action:
							| 'skip'
							| 'submit'
							| 'application-passwords-approval'
							| 'credentials-required'
							| 'already-wpcom'
							| 'site-is-not-using-wordpress';
						from: string;
						authorizationUrl: string;
						platform: ImporterPlatform;
					};

					if ( action === 'skip' ) {
						return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
					}

					if ( action === 'already-wpcom' ) {
						return navigate(
							paths.alreadyWpcomPath( { siteId, from: from || fromQueryParam, siteSlug } )
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
					const { action, authorizationUrl } = providedDependencies as {
						action: string;
						authorizationUrl: string;
					};

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
			}
		}

		const goBack = () => {
			const entryPoint = get( 'flow' )?.entryPoint;

			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					if ( entryPoint === 'calypso-importer' ) {
						return exitFlow(
							paths.calypsoImporterPath(
								{ engine: 'wordpress', ref: 'site-migration' },
								{ siteSlug }
							)
						);
					}

					if ( entryPoint === 'wp-admin-importers-list' ) {
						return exitFlow(
							paths.siteSetupImportListPath( {
								siteId,
								siteSlug,
								origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
								backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
								from: fromQueryParam,
							} )
						);
					}

					if ( entryPoint === 'wp-admin' ) {
						if ( null !== siteAdminUrl ) {
							window.location.replace( `${ siteAdminUrl }import.php` );
							return;
						}
						// Unexpected behavior probably caused by the user tinkering with the URL. Redirect to /start.
						return exitFlow( '/start' );
					}

					return navigate( paths.identifyPath( { from: fromQueryParam } ) );
				}

				case STEPS.SITE_MIGRATION_HOW_TO_MIGRATE.slug: {
					return navigate( paths.importOrMigratePath( { siteSlug, siteId } ) );
				}

				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					if ( entryPoint === 'wp-admin-importers-list' ) {
						return window.location.assign( `${ siteAdminUrl }import.php` );
					}

					const queryParams = Object.fromEntries( urlQueryParams );

					return exitFlow(
						paths.siteSetupGoalsPath( {
							siteSlug,
							...queryParams,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					return navigate(
						paths.howToMigratePath( {
							siteSlug,
							siteId,
							from: fromQueryParam,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_CREDENTIALS.slug: {
					if ( entryPoint === 'entrepreneur-signup' ) {
						// Note that the main entrepreneur flow takes users into the customize your store (CYS) UI,
						// but that's a bit abrupt for users who've gone through this secondary flow.
						if ( siteWooCommerceUrl ) {
							return exitFlow( siteWooCommerceUrl );
						} else if ( siteAdminUrl ) {
							return exitFlow( siteAdminUrl );
						}

						return exitFlow( `/home/${ siteId }` );
					}

					return navigate(
						paths.howToMigratePath( {
							siteSlug,
							siteId,
							from: fromQueryParam,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_OTHER_PLATFORM_DETECTED_IMPORT.slug: {
					return navigate(
						paths.credentialsPath( {
							siteId,
							siteSlug,
							from: fromQueryParam,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_FALLBACK_CREDENTIALS.slug: {
					if (
						urlQueryParams.get( 'backTo' ) ===
						STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug
					) {
						const queryParams = Object.fromEntries( urlQueryParams );
						return navigate(
							paths.applicationPasswordAuthorizationPath( {
								siteId,
								siteSlug,
								from: fromQueryParam,
								...queryParams,
							} )
						);
					}

					return navigate(
						paths.credentialsPath( {
							siteId,
							siteSlug,
							from: fromQueryParam,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_APPLICATION_PASSWORD_AUTHORIZATION.slug: {
					const queryParams = Object.fromEntries( urlQueryParams );

					return navigate(
						paths.credentialsPath( {
							siteId,
							siteSlug,
							from: fromQueryParam,
							...queryParams,
						} )
					);
				}

				case STEPS.SITE_MIGRATION_ALREADY_WPCOM.slug: {
					const queryParams = Object.fromEntries( urlQueryParams );

					return navigate(
						paths.credentialsPath( {
							siteId,
							siteSlug,
							from: fromQueryParam,
							...queryParams,
						} )
					);
				}
			}
		};

		return { goBack, submit, exitFlow };
	},
};

export default siteMigration;
