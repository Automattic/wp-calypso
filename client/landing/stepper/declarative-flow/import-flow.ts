import { Design, isBlankCanvasDesign } from '@automattic/design-picker';
import { IMPORT_FOCUSED_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import useAddTempSiteToSourceOptionMutation from 'calypso/data/site-migration/use-add-temp-site-mutation';
import { useSiteExcerptsQuery } from 'calypso/data/sites/use-site-excerpts-query';
import { useSiteQuery } from 'calypso/data/sites/use-site-query';
import { SITE_PICKER_FILTER_CONFIG } from 'calypso/landing/stepper/constants';
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
			{ slug: 'sitePicker', component: SitePickerStep },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setStepProgress, setPendingAction } = useDispatch( ONBOARD_STORE );
		const { data: sites } = useSiteExcerptsQuery( SITE_PICKER_FILTER_CONFIG );
		const { addTempSiteToSourceOption } = useAddTempSiteToSourceOptionMutation();
		const urlQueryParams = useQuery();
		const fromParam = urlQueryParams.get( 'from' );
		const { data: sourceSite } = useSiteQuery( fromParam as string );
		const siteSlugParam = useSiteSlugParam();
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
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
			const userHasSite = sites && sites.length > 0;

			// If there's any errors, we redirect them to the select/create a new site for a clean start
			if ( providedDependencies?.hasError ) {
				return userHasSite ? navigate( 'sitePicker' ) : navigate( 'siteCreationStep' );
			}
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

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStep ) {
				case 'importReady': {
					const depUrl = ( providedDependencies?.url as string ) || '';

					if (
						depUrl.startsWith( 'http' ) ||
						[ 'blogroll', 'ghost', 'tumblr', 'livejournal', 'movabletype', 'xanga' ].indexOf(
							providedDependencies?.platform as ImporterMainPlatform
						) !== -1
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
				case 'importerSquarespace':
				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
				}

				case 'designSetup': {
					const _selectedDesign = providedDependencies?.selectedDesign as Design;
					if ( _selectedDesign?.design_type === 'assembler' ) {
						return navigate( 'patternAssembler' );
					}

					return navigate( 'processing' );
				}

				case 'patternAssembler':
					return navigate( 'processing' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					if ( providedDependencies?.siteSlug ) {
						return ! fromParam
							? navigate( `import?siteSlug=${ providedDependencies?.siteSlug }` )
							: navigate(
									`import?siteSlug=${ providedDependencies?.siteSlug }&from=${ fromParam }`
							  );
					}
					// End of Pattern Assembler flow
					if ( isBlankCanvasDesign( selectedDesign ) ) {
						return exitFlow( `/site-editor/${ siteSlugParam }` );
					}

					return exitFlow( `/home/${ siteSlugParam }` );
				}
				case 'migrationHandler': {
					return handleMigrationRedirects( providedDependencies );
				}

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

							if ( selectedSite && sourceSite ) {
								// Store temporary target blog id to source site option
								selectedSite &&
									sourceSite &&
									addTempSiteToSourceOption( selectedSite.ID, sourceSite.ID );

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
			const source = urlQueryParams.get( 'source' );

			switch ( _currentStep ) {
				case 'import': {
					if ( source === 'sites-dashboard' ) {
						return window.location.assign( '/sites' );
					}

					return;
				}

				case 'importList':
					// eslint-disable-next-line no-case-declarations
					const backToStep = urlQueryParams.get( 'backToStep' );

					if ( backToStep ) {
						const path = addQueryArgs( backToStep, { siteSlug: siteSlugParam, source } );

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
					return navigate( addQueryArgs( 'import', { siteSlug: siteSlugParam, source } ) );
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
