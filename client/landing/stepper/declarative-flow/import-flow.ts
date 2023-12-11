import { Design, isAssemblerDesign, isAssemblerSupported } from '@automattic/design-picker';
import { IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import useAddTempSiteToSourceOptionMutation from 'calypso/data/site-migration/use-add-temp-site-mutation';
import { useSourceMigrationStatusQuery } from 'calypso/data/site-migration/use-source-migration-status-query';
import MigrationError from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/migration-error';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import DesignSetup from './internals/steps-repository/design-setup';
import ImportStep from './internals/steps-repository/import';
import ImportList from './internals/steps-repository/import-list';
import ImportReady from './internals/steps-repository/import-ready';
import ImportReadyNot from './internals/steps-repository/import-ready-not';
import ImportReadyPreview from './internals/steps-repository/import-ready-preview';
import ImportReadyWpcom from './internals/steps-repository/import-ready-wpcom';
import ImportVerifyEmail from './internals/steps-repository/import-verify-email';
import ImporterBlogger from './internals/steps-repository/importer-blogger';
import ImporterMedium from './internals/steps-repository/importer-medium';
import ImporterSquarespace from './internals/steps-repository/importer-squarespace';
import ImporterWix from './internals/steps-repository/importer-wix';
import ImporterWordpress from './internals/steps-repository/importer-wordpress';
import MigrationHandler from './internals/steps-repository/migration-handler';
import PatternAssembler from './internals/steps-repository/pattern-assembler';
import ProcessingStep from './internals/steps-repository/processing-step';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import SitePickerStep from './internals/steps-repository/site-picker';
import TrialAcknowledge from './internals/steps-repository/trial-acknowledge';
import { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { SiteExcerptData } from 'calypso/data/sites/site-excerpt-types';

const importFlow: Flow = {
	name: IMPORT_FOCUSED_FLOW,

	useSteps() {
		return [
			{ slug: 'import', component: ImportStep },
			{ slug: 'importList', component: ImportList },
			{ slug: 'importReady', component: ImportReady },
			{ slug: 'importReadyNot', component: ImportReadyNot },
			{ slug: 'importReadyWpcom', component: ImportReadyWpcom },
			{ slug: 'importReadyPreview', component: ImportReadyPreview },
			{ slug: 'importerWix', component: ImporterWix },
			{ slug: 'importerBlogger', component: ImporterBlogger },
			{ slug: 'importerMedium', component: ImporterMedium },
			{ slug: 'importerSquarespace', component: ImporterSquarespace },
			{ slug: 'importerWordpress', component: ImporterWordpress },
			{ slug: 'designSetup', component: DesignSetup },
			{ slug: 'patternAssembler', component: PatternAssembler },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'migrationHandler', component: MigrationHandler },
			{ slug: 'trialAcknowledge', component: TrialAcknowledge },
			{ slug: 'sitePicker', component: SitePickerStep },
			{ slug: 'error', component: MigrationError },
			{ slug: 'verifyEmail', component: ImportVerifyEmail },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setStepProgress, setPendingAction } = useDispatch( ONBOARD_STORE );
		const { addTempSiteToSourceOption } = useAddTempSiteToSourceOptionMutation();
		const urlQueryParams = useQuery();
		const fromParam = urlQueryParams.get( 'from' );
		const { data: migrationStatus } = useSourceMigrationStatusQuery( fromParam );
		const siteSlugParam = useSiteSlugParam();
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const isMigrateFromWp = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIsMigrateFromWp(),
			[]
		);
		const flowProgress = useSiteSetupFlowProgress( _currentStep, 'import' );

		if ( flowProgress ) {
			setStepProgress( flowProgress );
		}

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
					return userHasSite ? navigate( 'sitePicker' ) : navigate( 'siteCreationStep' );
				}
				// For some reason, the admin role is mismatch, we want to select/create a new site for them as well
				if ( providedDependencies?.isAdminOnTarget === false ) {
					return userHasSite ? navigate( 'sitePicker' ) : navigate( 'siteCreationStep' );
				}
			}
			// For those who hasn't paid or in the middle of the migration process, we sent them to the importerWordPress step
			return navigate(
				`importerWordpress?siteSlug=${ providedDependencies?.targetBlogSlug }&from=${ fromParam }&option=everything`
			);
		};

		const submit = ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
			switch ( _currentStep ) {
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
					const { selectedDesign: _selectedDesign } = providedDependencies;
					if ( isAssemblerDesign( _selectedDesign as Design ) && isAssemblerSupported() ) {
						return navigate( 'patternAssembler' );
					}

					return navigate( 'processing' );
				}

				case 'patternAssembler':
					return navigate( 'processing' );

				case 'siteCreationStep':
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
					// End of Pattern Assembler flow
					if ( isAssemblerDesign( selectedDesign ) ) {
						return exitFlow( `/site-editor/${ siteSlugParam }` );
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
							return navigate( 'siteCreationStep' );

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

					return navigate( 'import' );

				case 'importReady':
				case 'importReadyNot':
				case 'importReadyWpcom':
				case 'importReadyPreview':
				case 'importerWix':
				case 'importerBlogger':
				case 'importerMedium':
				case 'importerSquarespace':
				case 'importerWordpress':
				case 'designSetup':
					if ( isMigrateFromWp && fromParam ) {
						return navigate( `sitePicker?from=${ fromParam }` );
					}
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
