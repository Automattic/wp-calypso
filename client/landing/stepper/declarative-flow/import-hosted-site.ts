import { IMPORT_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useLayoutEffect } from 'react';
import localStorageHelper from 'store';
import { isTargetSitePlanCompatible } from 'calypso/blocks/importer/util';
import CreateSite from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/create-site';
import MigrationError from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/migration-error';
import { ProcessingResult } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/processing-step/constants';
import { useIsSiteAdmin } from 'calypso/landing/stepper/hooks/use-is-site-admin';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteSlugParam } from 'calypso/landing/stepper/hooks/use-site-slug-param';
import { ONBOARD_STORE, USER_STORE } from 'calypso/landing/stepper/stores';
import { ImporterMainPlatform } from 'calypso/lib/importer/types';
import { useSite } from '../hooks/use-site';
import { useLoginUrl } from '../utils/path';
import Import from './internals/steps-repository/import';
import ImportReady from './internals/steps-repository/import-ready';
import ImportReadyNot from './internals/steps-repository/import-ready-not';
import ImportReadyPreview from './internals/steps-repository/import-ready-preview';
import ImportReadyWpcom from './internals/steps-repository/import-ready-wpcom';
import ImportVerifyEmail from './internals/steps-repository/import-verify-email';
import ImporterMigrateMessage from './internals/steps-repository/importer-migrate-message';
import ImporterWordpress from './internals/steps-repository/importer-wordpress';
import ProcessingStep from './internals/steps-repository/processing-step';
import SitePickerStep from './internals/steps-repository/site-picker';
import TrialAcknowledge from './internals/steps-repository/trial-acknowledge';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { UserSelect } from '@automattic/data-stores';
import type { SiteExcerptData } from '@automattic/sites';

const importHostedSiteFlow: Flow = {
	name: IMPORT_HOSTED_SITE_FLOW,
	isSignupFlow: true,

	useSteps() {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			resetOnboardStore();
		}, [] );

		return [
			{ slug: 'import', component: Import },
			{ slug: 'importReady', component: ImportReady },
			{ slug: 'importReadyNot', component: ImportReadyNot },
			{ slug: 'importReadyWpcom', component: ImportReadyWpcom },
			{ slug: 'importReadyPreview', component: ImportReadyPreview },
			{ slug: 'sitePicker', component: SitePickerStep },
			{ slug: 'createSite', component: CreateSite },
			{ slug: 'importerWordpress', component: ImporterWordpress },
			{ slug: 'trialAcknowledge', component: TrialAcknowledge },
			{ slug: 'verifyEmail', component: ImportVerifyEmail },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'error', component: MigrationError },
			{ slug: 'migrateMessage', component: ImporterMigrateMessage },
		];
	},

	useAssertConditions(): AssertConditionResult {
		const { isAdmin, isFetching } = useIsSiteAdmin();
		const result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		useEffect( () => {
			if ( isAdmin === false && ! isFetching ) {
				window.location.assign( `/setup/${ this.name }/import` );
			}
		}, [ isAdmin, isFetching ] );

		return result;
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const urlQueryParams = useQuery();
		const fromParam = urlQueryParams.get( 'from' );
		const siteSlugParam = useSiteSlugParam();
		const site = useSite();
		const isSitePlanCompatible = site && isTargetSitePlanCompatible( site );
		const siteCount =
			useSelect( ( select ) => ( select( USER_STORE ) as UserSelect ).getCurrentUser(), [] )
				?.site_count ?? 0;

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

							urlQueryParams.set( 'siteSlug', selectedSite.slug );
							urlQueryParams.set( 'from', fromParam as string );
							urlQueryParams.set( 'option', 'everything' );

							return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
						}

						case 'create-site':
							return navigate( 'createSite' );
					}
				}
				case 'importReadyPreview': {
					const params = new URLSearchParams( providedDependencies?.url as string );
					const from = params.get( 'from' ) ?? '';

					if ( ! siteSlugParam ) {
						if ( siteCount > 0 ) {
							return navigate( `sitePicker?from=${ encodeURIComponent( from ) }` );
						}

						if ( from ) {
							return navigate( `createSite?from=${ encodeURIComponent( from ) }` );
						}
						return navigate( 'error' );
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

				case 'verifyEmail':
					return navigate( `importerWordpress?${ urlQueryParams.toString() }` );

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

				case 'createSite':
					return navigate( 'processing' );

				case 'error':
					return navigate( providedDependencies?.url as string );
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'import':
					return window.location.assign( '/sites?hosting-flow=true' );

				case 'importerWordpress':
					if ( urlQueryParams.has( 'showModal' ) ) {
						// remove the siteSlug in case they want to change the destination site
						urlQueryParams.delete( 'siteSlug' );
						urlQueryParams.delete( 'showModal' );
						return navigate( `sitePicker?${ urlQueryParams.toString() }` );
					}

					if ( ! isSitePlanCompatible ) {
						urlQueryParams.set( 'showModal', 'true' );
						return navigate( `importerWordpress?${ urlQueryParams.toString() }` );
					}

					return navigate( `sitePicker?${ urlQueryParams.toString() }` );

				case 'sitePicker':
					// remove the from parameter to restart the flow
					urlQueryParams.delete( 'from' );
					return navigate( `import?${ urlQueryParams.toString() }` );

				case 'importReadyNot':
					urlQueryParams.delete( 'siteSlug' );
					urlQueryParams.delete( 'from' );
					return navigate( `import?${ urlQueryParams.toString() }` );
				case 'importReady':
				case 'importReadyWpcom':
				case 'importReadyPreview':
					// remove the siteSlug in case they want to change the
					// destination site
					urlQueryParams.delete( 'siteSlug' );
					return navigate( `import?${ urlQueryParams.toString() }` );

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
				case 'import':
					return navigate( `import?siteSlug=${ siteSlugParam }` );
				default:
					return navigate( step );
			}
		};

		return { goNext, goBack, goToStep, submit };
	},
	useSideEffect( currentStep ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }`,
		} );

		const urlQueryParams = useQuery();
		const restoreFlowQueryParam = urlQueryParams.get( 'restore-progress' );

		useLayoutEffect( () => {
			if ( ! userIsLoggedIn ) {
				window.location.assign( logInUrl );
			}

			if ( restoreFlowQueryParam === null ) {
				localStorageHelper.set( 'site-migration-url', window.location.href );
				return;
			}

			let validURL = false;
			const storedUrlString = localStorageHelper.get( 'site-migration-url' );
			try {
				const storedUrl = new URL( storedUrlString );
				validURL = storedUrl.searchParams.has( 'from' );
			} catch ( e ) {}

			if ( validURL ) {
				window.location.assign( storedUrlString );
				return;
			}
		}, [ userIsLoggedIn, currentStep, restoreFlowQueryParam ] );
	},
};

export default importHostedSiteFlow;
