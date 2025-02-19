import { IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { isTargetSitePlanCompatible } from 'calypso/blocks/importer/util';
import useAddTempSiteToSourceOptionMutation from 'calypso/data/site-migration/use-add-temp-site-mutation';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { ImporterMainPlatform } from 'calypso/lib/importer/types';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import {
	AssertConditionState,
	Flow,
	ProvidedDependencies,
	AssertConditionResult,
} from './internals/types';
import type { OnboardSelect, UserSelect } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';

const importFlow: Flow = {
	name: IMPORT_FOCUSED_FLOW,
	isSignupFlow: true,

	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.IMPORT,
			STEPS.IMPORT_LIST,
			STEPS.IMPORT_READY,
			STEPS.IMPORT_READY_NOT,
			STEPS.IMPORT_READY_PREVIEW,
			STEPS.IMPORT_READY_WPCOM,
			STEPS.IMPORTER_WIX,
			STEPS.IMPORTER_BLOGGER,
			STEPS.IMPORTER_MEDIUM,
			STEPS.IMPORTER_SQUARESPACE,
			STEPS.IMPORTER_WORDPRESS,
			STEPS.DESIGN_SETUP,
			STEPS.PROCESSING,
			STEPS.SITE_CREATION_STEP,
			STEPS.MIGRATION_HANDLER,
			STEPS.TRIAL_ACKNOWLEDGE,
			STEPS.PICK_SITE,
			STEPS.ERROR,
			STEPS.VERIFY_EMAIL,
			STEPS.SITE_MIGRATION_ASSISTED_MIGRATION,
			STEPS.MIGRATION_ERROR,
		] );
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const { isAdmin, isFetching } = useIsSiteAdmin();

		useEffect( () => {
			if ( userIsLoggedIn && isAdmin === false && ! isFetching ) {
				window.location.assign( `/setup/${ this.name }/import` );
			}
		}, [ isAdmin, isFetching, userIsLoggedIn ] );

		return { state: AssertConditionState.SUCCESS };
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const { addTempSiteToSourceOption } = useAddTempSiteToSourceOptionMutation();
		const urlQueryParams = useQuery();
		const site = useSite();
		const isSitePlanCompatible = site && isTargetSitePlanCompatible( site );
		const fromParam = urlQueryParams.get( 'from' );
		const { data: migrationStatus } = useSourceMigrationStatusQuery( fromParam );
		const siteSlugParam = useSiteSlugParam();
		const isMigrateFromWp = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
			[]
		);

		const exitFlow = ( to: string ) => {
			setPendingAction( () => {
				return new Promise( () => {
					if ( ! siteSlugParam ) {
						return;
					}

					window.location.assign( to );
				} );
			} );

			return navigate( 'processing' );
		};

		const handleMigrationRedirects = ( providedDependencies: ProvidedDependencies = {} ) => {
			const { userHasSite } = providedDependencies;

			if ( providedDependencies?.status === 'inactive' ) {
				// This means they haven't kick off the migration before, so we send them to select/create a new site
				if ( ! providedDependencies?.targetBlogId ) {
					return userHasSite ? navigate( 'sitePicker' ) : navigate( 'createSite' );
				}
				// For some reason, the admin role is mismatch, we want to select/create a new site for them as well
				if ( providedDependencies?.isAdminOnTarget === false ) {
					return userHasSite ? navigate( 'sitePicker' ) : navigate( 'createSite' );
				}
			}
			// For those who hasn't paid or in the middle of the migration process, we sent them to the importerWordPress step
			return navigate(
				`importerWordpress?siteSlug=${ providedDependencies?.targetBlogSlug }&from=${ fromParam }&option=everything`
			);
		};

		const submit = ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
			switch ( _currentStep ) {
				case 'importList':
				case 'importReady': {
					const depUrl = ( providedDependencies?.url as string ) || '';

					if (
						depUrl.startsWith( 'http' ) ||
						[
							'blogroll',
							'ghost',
							'tumblr',
							'livejournal',
							'movabletype',
							'xanga',
							'substack',
						].indexOf( providedDependencies?.platform as ImporterMainPlatform ) !== -1
					) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
				}
				case 'importReadyPreview': {
					return navigate( providedDependencies?.url as string );
				}

				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
				}

				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					switch ( providedDependencies?.action ) {
						case 'verify-email':
							return navigate( `verifyEmail?${ urlQueryParams.toString() }` );
						case 'checkout':
							return exitFlow( providedDependencies?.checkoutUrl as string );
						default:
							return navigate( providedDependencies?.url as string );
					}
				}

				case 'designSetup': {
					return navigate( 'processing' );
				}

				case 'createSite':
					return navigate( 'processing' );

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					if ( providedDependencies?.siteSlug ) {
						if ( fromParam ) {
							const selectedSiteSlug = providedDependencies?.siteSlug as string;
							urlQueryParams.set( 'siteSlug', selectedSiteSlug );
							urlQueryParams.set( 'from', fromParam );
							urlQueryParams.set( 'option', 'everything' );

							return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
						}
						return navigate( `import?siteSlug=${ providedDependencies?.siteSlug }` );
					}

					return exitFlow( `/home/${ siteSlugParam }` );
				}

				case 'migrationHandler': {
					return handleMigrationRedirects( providedDependencies );
				}

				case 'trialAcknowledge': {
					switch ( providedDependencies?.action ) {
						case 'verify-email':
							return navigate( `verifyEmail?${ urlQueryParams.toString() }` );
						case 'importer':
							return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
						case 'checkout':
							return exitFlow( providedDependencies?.checkoutUrl as string );
						default:
							return;
					}
				}

				case 'error':
					return navigate( providedDependencies?.url as string );

				case 'verifyEmail':
					return navigate( `importerWordpress?${ urlQueryParams.toString() }` );

				case 'sitePicker': {
					switch ( providedDependencies?.action ) {
						case 'update-query': {
							const newQueryParams =
								( providedDependencies?.queryParams as { [ key: string ]: string } ) || {};

							Object.keys( newQueryParams ).forEach( ( key ) => {
								newQueryParams[ key ]
									? urlQueryParams.set( key, newQueryParams[ key ] )
									: urlQueryParams.delete( key );
							} );

							return navigate( `sitePicker?${ urlQueryParams.toString() }` );
						}

						case 'select-site': {
							const selectedSite = providedDependencies.site as SiteExcerptData;
							const skipStoringTempTargetSite = urlQueryParams.get( 'skipStoringTempTargetSite' );

							if ( selectedSite && migrationStatus ) {
								// Store temporary target blog id to source site option
								! skipStoringTempTargetSite &&
									selectedSite &&
									migrationStatus?.source_blog_id &&
									addTempSiteToSourceOption( selectedSite.ID, migrationStatus.source_blog_id );

								urlQueryParams.set( 'siteSlug', selectedSite.slug );
								urlQueryParams.set( 'option', 'everything' );

								return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
							}
						}

						case 'create-site':
							return navigate( 'createSite' );

						default:
							return navigate( `migrationHandler` );
					}
				}
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'importList':
					// eslint-disable-next-line no-case-declarations
					const backToStep = urlQueryParams.get( 'backToStep' );

					if ( backToStep ) {
						const path = `${ backToStep }?siteSlug=${ siteSlugParam }`;

						return navigate( path );
					}

					return navigate( `import?siteSlug=${ siteSlugParam }` );

				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
					return navigate( `importList?siteSlug=${ siteSlugParam }` );

				case 'importerWordpress':
					if ( urlQueryParams.get( 'option' ) === 'content' ) {
						return navigate( `importList?siteSlug=${ siteSlugParam }` );
					} else if ( isMigrateFromWp && fromParam ) {
						return navigate( `sitePicker?from=${ fromParam }` );
					} else if ( urlQueryParams.has( 'showModal' ) ) {
						urlQueryParams.delete( 'showModal' );
						return navigate( `import?siteSlug=${ siteSlugParam }` );
					}

					// In this case, it means that we are in the Upgrade Plan page
					if ( ! isSitePlanCompatible ) {
						urlQueryParams.set( 'showModal', 'true' );
						return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
					}

					return navigate( `import?siteSlug=${ siteSlugParam }` );
				case 'importerWix':
				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview':
				case 'designSetup':
					return navigate( `import?siteSlug=${ siteSlugParam }` );

				case 'verifyEmail':
				case 'trialAcknowledge':
					return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
			}
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'import':
					return exitFlow( `/home/${ siteSlugParam }` );
				default:
					return navigate( 'import' );
			}
		};

		const goToStep = ( step: string ) => {
			switch ( step ) {
				case 'goals':
					return exitFlow( `/setup/site-setup/goals?siteSlug=${ siteSlugParam }` );
				case 'import':
					return navigate( `import?siteSlug=${ siteSlugParam }` );
				default:
					return navigate( step );
			}
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default importFlow;
