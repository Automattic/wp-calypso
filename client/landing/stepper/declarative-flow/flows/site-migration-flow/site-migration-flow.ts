import { PLAN_MIGRATION_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { Onboard, type SiteSelect, type UserSelect } from '@automattic/data-stores';
import { isHostedSiteMigrationFlow, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { SiteExcerptData } from '@automattic/sites';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { HOSTING_INTENT_MIGRATE } from 'calypso/data/hosting/use-add-hosting-trial-mutation';
import { HOW_TO_MIGRATE_OPTIONS } from 'calypso/landing/stepper/constants';
import { useFlowState } from 'calypso/landing/stepper/declarative-flow/internals/state-manager/store';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
//TODO: Move to a shared place
import {
	isPlatformImportable,
	getFullImporterUrl,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { getSiteIdParam } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/util';
import { type SiteMigrationIdentifyAction } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/site-migration-identify';
import { AssertConditionState } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { goToImporter } from 'calypso/landing/stepper/declarative-flow/migration/helpers';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { USER_STORE, SITE_STORE, ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { ImporterPlatform } from 'calypso/lib/importer/types';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
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
];

const HOSTED_VARIANT_STEPS = [
	...BASE_STEPS,
	STEPS.PICK_SITE,
	STEPS.SITE_CREATION_STEP,
	STEPS.PROCESSING,
];

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
		if ( isHostedSiteMigrationFlow( this.variantSlug ?? SITE_MIGRATION_FLOW ) ) {
			return stepsWithRequiredLogin( HOSTED_VARIANT_STEPS );
		}

		return stepsWithRequiredLogin( BASE_STEPS );
	},

	useAssertConditions(): AssertConditionResult {
		const { siteSlug, siteId } = useSiteData();
		const { isAdmin } = useIsSiteAdmin();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const flowPath = this.variantSlug ?? SITE_MIGRATION_FLOW;

		useEffect( () => {
			if ( isAdmin === false ) {
				window.location.assign( '/start' );
			}
		}, [ isAdmin ] );

		if ( userIsLoggedIn && ! siteSlug && ! siteId && ! isHostedSiteMigrationFlow( flowPath ) ) {
			window.location.assign( '/' );
			return {
				state: AssertConditionState.FAILURE,
				message: 'site-migration does not have the site slug or site id.',
			};
		}

		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const { siteId } = useSiteData();
		const variantSlug = this.variantSlug;
		const flowPath = variantSlug ?? flowName;
		const siteCount =
			useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
				?.site_count ?? 0;
		const siteSlugParam = useSiteSlugParam();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );
		const actionQueryParam = urlQueryParams.get( 'action' );
		const platformQueryParam = urlQueryParams.get( 'platform' );
		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );

		const { get, sessionId } = useFlowState();

		const siteAdminUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );
		const siteWooCommerceUrl = useSelector( ( state ) => getSiteWooCommerceUrl( state, siteId ) );

		const exitFlow = ( to: string ) => {
			return window.location.assign( addQueryArgs( { sessionId }, to ) );
		};

		// Call triggerGuidesForStep for the current step
		useEffect( () => {
			triggerGuidesForStep( flowName, currentStep, siteId );
		}, [ flowName, currentStep, siteId ] );

		// TODO - We may need to add `...params: string[]` back once we start adding more steps.
		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug ) || getSiteIdParam( urlQueryParams );

			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: string;
						action: SiteMigrationIdentifyAction;
					};

					if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
						if ( isHostedSiteMigrationFlow( variantSlug ?? '' ) ) {
							// siteId/siteSlug wont be defined here if coming from a direct link/signup.
							// We need to make sure there's a site to import into.
							if ( ! siteSlugParam ) {
								return navigate( paths.siteCreationPath( { from, skipMigration: true } ) );
							}
						}
						return exitFlow(
							paths.siteSetupImportListPath( {
								siteId,
								siteSlug,
								from,
								origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
								backToFlow: `/${ flowPath }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
							} )
						);
					}

					if ( isHostedSiteMigrationFlow( variantSlug ?? '' ) ) {
						if ( ! siteSlugParam ) {
							if ( siteCount > 0 ) {
								return navigate( paths.sitePickerPath( { from } ) );
							}

							if ( from ) {
								return navigate( paths.siteCreationPath( { from } ) );
							}

							return navigate( 'error' );
						}
					}

					return navigate( paths.importOrMigratePath( { from, siteSlug, siteId } ) );
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
									...queryParams,
								} )
							);
						}
						case 'select-site': {
							const { ID: newSiteId, slug: newSiteSlug } =
								providedDependencies.site as SiteExcerptData;

							if ( 'migrate' === actionQueryParam ) {
								return navigate(
									paths.howToMigratePath( {
										siteSlug: newSiteSlug,
										siteId: newSiteId,
										from: fromQueryParam,
									} )
								);
							}
							return navigate(
								paths.importOrMigratePath( { siteSlug: newSiteSlug, siteId: newSiteId } )
							);
						}
						case 'create-site':
							return navigate( paths.siteCreationPath( { from: fromQueryParam } ) );
					}
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					const queryArgs = {
						from: fromQueryParam,
						skipMigration: 'import' === actionQueryParam ? true : undefined,
					};

					return navigate( paths.processingPath( queryArgs ) );
				}

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies?.siteCreated ) {
						if (
							platformQueryParam &&
							platformQueryParam !== 'wordpress' &&
							isPlatformImportable( platformQueryParam as ImporterPlatform ) &&
							fromQueryParam
						) {
							return exitFlow(
								getFullImporterUrl(
									platformQueryParam as ImporterPlatform,
									siteSlug,
									fromQueryParam
								)
							);
						}
						if ( ! fromQueryParam || providedDependencies?.skipMigration ) {
							// If we get to this point without a fromQueryParam then we are coming from a direct
							// pick your current platform link. That's why we navigate to the importList step.
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

						// If the action is migrate, navigate to the DIY/DIFM selector screen.
						if ( 'migrate' === actionQueryParam ) {
							return navigate(
								paths.howToMigratePath( {
									siteSlug: siteSlug,
									siteId: siteId,
									from: fromQueryParam,
								} )
							);
						}

						return navigate(
							paths.importOrMigratePath( { siteSlug, siteId, from: fromQueryParam } )
						);
					}
				}

				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					// Switch to the normal Import flow.
					if ( providedDependencies?.destination === 'import' ) {
						if ( urlQueryParams.get( 'ref' ) === 'calypso-importer' ) {
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
								option: 'content',
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

					// Do it for me option.
					if ( providedDependencies?.how === HOW_TO_MIGRATE_OPTIONS.DO_IT_FOR_ME ) {
						return navigate( paths.credentialsPath( { siteId, from: fromQueryParam, siteSlug } ) );
					}

					// Continue with the migration flow.
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
						paths.supportInstructionsPath( {
							siteId,
							from: fromQueryParam,
							siteSlug,
						} )
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
								from: fromQueryParam,
							} )
						);
					}

					return exitFlow( paths.calypsoOverviewPath( { ref: 'site-migration' }, { siteSlug } ) );
				}
			}
		}

		const goBack = () => {
			const siteSlug = urlQueryParams.get( 'siteSlug' ) || '';
			const siteId = urlQueryParams.get( 'siteId' ) || '';
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
