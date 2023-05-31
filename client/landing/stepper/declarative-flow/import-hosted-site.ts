import { isEnabled } from '@automattic/calypso-config';
import { IMPORT_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { ImporterMainPlatform } from 'calypso/blocks/import/types';
import MigrationError from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/migration-error';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSiteSetupFlowProgress } from '../hooks/use-site-setup-flow-progress';
import ImportList from './internals/steps-repository/import-list';
import ImportReady from './internals/steps-repository/import-ready';
import ImportReadyNot from './internals/steps-repository/import-ready-not';
import ImportReadyPreview from './internals/steps-repository/import-ready-preview';
import ImportReadyWpcom from './internals/steps-repository/import-ready-wpcom';
import ImportWithSiteAddressStep from './internals/steps-repository/import-with-site-address';
import ImporterWordpress from './internals/steps-repository/importer-wordpress';
import MigrationHandler from './internals/steps-repository/migration-handler';
import SiteCreationStep from './internals/steps-repository/site-creation-step';
import { Flow, ProvidedDependencies } from './internals/types';

const importHostedSiteFlow: Flow = {
	name: IMPORT_HOSTED_SITE_FLOW,

	useSteps() {
		return [
			{ slug: 'import', component: ImportWithSiteAddressStep },
			{ slug: 'importList', component: ImportList },
			{ slug: 'importReady', component: ImportReady },
			{ slug: 'importReadyNot', component: ImportReadyNot },
			{ slug: 'importReadyWpcom', component: ImportReadyWpcom },
			{ slug: 'importReadyPreview', component: ImportReadyPreview },
			{ slug: 'importerWordpress', component: ImporterWordpress },
			{ slug: 'siteCreationStep', component: SiteCreationStep },
			{ slug: 'migrationHandler', component: MigrationHandler },
			{ slug: 'error', component: MigrationError },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setStepProgress, setPendingAction } = useDispatch( ONBOARD_STORE );
		const urlQueryParams = useQuery();
		const fromParam = urlQueryParams.get( 'from' );
		const siteSlugParam = useSiteSlugParam();

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

		const submit = ( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) => {
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

				case 'importerWordpress': {
					if ( providedDependencies?.type === 'redirect' ) {
						return exitFlow( providedDependencies?.url as string );
					}

					return navigate( providedDependencies?.url as string );
				}

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;
					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					if ( providedDependencies?.siteSlug ) {
						if ( isEnabled( 'onboarding/import-redesign' ) && fromParam ) {
							const slectedSiteSlug = providedDependencies?.siteSlug as string;
							urlQueryParams.set( 'siteSlug', slectedSiteSlug );
							urlQueryParams.set( 'from', fromParam );
							urlQueryParams.set( 'option', 'everything' );

							return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
						}

						return ! fromParam
							? navigate( `import?siteSlug=${ providedDependencies?.siteSlug }` )
							: navigate(
									`import?siteSlug=${ providedDependencies?.siteSlug }&from=${ fromParam }`
							  );
					}

					return exitFlow( `/home/${ siteSlugParam }` );
				}

				case 'error':
					return navigate( providedDependencies?.url as string );
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
				case 'importerWordpress':
					return navigate( `import?siteSlug=${ siteSlugParam }` );
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
				case 'import':
					return navigate( `import?siteSlug=${ siteSlugParam }` );
				default:
					return navigate( step );
			}
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default importHostedSiteFlow;
