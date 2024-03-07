import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/url';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { goToCheckout } from '../utils/checkout';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const siteMigration: Flow = {
	name: 'site-migration',
	isSignupFlow: false,

	useSteps() {
		return [
			STEPS.SITE_MIGRATION_IDENTIFY,
			STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
			STEPS.BUNDLE_TRANSFER,
			STEPS.SITE_MIGRATION_PLUGIN_INSTALL,
			STEPS.PROCESSING,
			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
			STEPS.SITE_MIGRATION_INSTRUCTIONS,
			STEPS.ERROR,
		];
	},
	useAssertConditions(): AssertConditionResult {
		const { setProfilerData } = useDispatch( ONBOARD_STORE );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const flowName = this.name;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		const queryParams = new URLSearchParams( window.location.search );
		const profilerData = queryParams.get( 'profilerdata' );
		const aff = queryParams.get( 'aff' );
		const vendorId = queryParams.get( 'vid' );

		if ( profilerData ) {
			try {
				const decodedProfilerData = JSON.parse(
					decodeURIComponent( escape( window.atob( profilerData ) ) )
				);

				setProfilerData( decodedProfilerData );
				// Ignore any bad/invalid data and prevent it from causing downstream issues.
			} catch {}
		}

		const getStartUrl = () => {
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();
			const queryParams = new URLSearchParams();

			if ( vendorId ) {
				queryParams.set( 'vid', vendorId );
			}

			if ( aff ) {
				queryParams.set( 'aff', aff );
			}

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				`/setup/site-migration` +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );

			let queryString = `redirect_to=${ redirectTarget }`;

			if ( queryParams.toString() ) {
				queryString = `${ queryString }&${ queryParams.toString() }`;
			}

			const logInUrl = getLoginUrl( {
				variationName: flowName,
				locale,
			} );

			return `${ logInUrl }&${ queryString }`;
		};

		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = getStartUrl();
				window.location.assign( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'site-migration requires a logged in user',
			};
		}

		return result;
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
		const siteSlugParam = useSiteSlugParam();
		const urlQueryParams = useQuery();

		const { getSiteIdBySlug } = useSelect( ( select ) => select( SITE_STORE ) as SiteSelect, [] );
		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		// TODO - We may need to add `...params: string[]` back once we start adding more steps.
		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, intent, flowName, currentStep );
			const siteSlug = ( providedDependencies?.siteSlug as string ) || siteSlugParam || '';
			const siteId = getSiteIdBySlug( siteSlug );

			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const { from, platform } = providedDependencies as { from: string; platform: string };

					if ( platform === 'wordpress' ) {
						return navigate(
							addQueryArgs(
								{ from: from, siteSlug, siteId },
								STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug
							)
						);
					}

					return exitFlow(
						addQueryArgs(
							{ siteId, siteSlug, from, origin: STEPS.SITE_MIGRATION_IDENTIFY.slug },
							'/setup/site-setup/importList'
						)
					);
				}
				case STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug: {
					// Switch to the normal Import flow.
					if ( providedDependencies?.destination === 'import' ) {
						return exitFlow(
							`/setup/site-setup/importList?siteSlug=${ siteSlug }&siteId=${ siteId }`
						);
					}

					// Take the user to the upgrade plan step.
					if ( providedDependencies?.destination === 'upgrade' ) {
						// TODO - Once the upgrade plan step is available, we'll want to change this to use the slug constant.
						return navigate( 'site-migration-upgrade-plan', {
							siteId,
							siteSlug,
						} );
					}

					// Continue with the migration flow.
					return navigate( STEPS.BUNDLE_TRANSFER.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.BUNDLE_TRANSFER.slug: {
					return navigate( STEPS.PROCESSING.slug, { bundleProcessing: true } );
				}

				case STEPS.SITE_MIGRATION_PLUGIN_INSTALL.slug: {
					return navigate( STEPS.PROCESSING.slug, { pluginInstall: true } );
				}

				case STEPS.PROCESSING.slug: {
					// Any process errors go to the error step.
					if ( providedDependencies?.error ) {
						return navigate( STEPS.ERROR.slug );
					}

					// If the plugin was installed successfully, go to the migration instructions.
					if ( providedDependencies?.pluginInstall ) {
						return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug );
					}

					// Otherwise processing has finished from the BundleTransfer step and we need to install the plugin.
					return navigate( STEPS.SITE_MIGRATION_PLUGIN_INSTALL.slug );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					if ( providedDependencies?.goToCheckout ) {
						const destination = addQueryArgs(
							{
								flags: 'onboarding/new-migration-flow',
								siteSlug,
							},
							`/setup/site-migration/${ STEPS.BUNDLE_TRANSFER.slug }`
						);
						goToCheckout( {
							flowName: 'site-migration',
							stepName: 'site-migration-upgrade-plan',
							siteSlug: siteSlug,
							destination: destination,
							plan: providedDependencies.plan as string,
						} );
						return;
					}
					if ( providedDependencies?.freeTrialSelected ) {
						return navigate( STEPS.BUNDLE_TRANSFER.slug, {
							siteId,
							siteSlug,
						} );
					}
					if ( providedDependencies?.verifyEmail ) {
						// not yet implemented
						return;
					}
				}

				case STEPS.SITE_MIGRATION_INSTRUCTIONS.slug: {
					return exitFlow( `/home/${ siteSlug }` );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					return exitFlow( `/setup/site-setup/goals?${ urlQueryParams }` );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					return navigate( `${ STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE.slug }?${ urlQueryParams }` );
				}
			}
		};

		return { goBack, submit, exitFlow };
	},
};

export default siteMigration;
