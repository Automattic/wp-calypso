import { useLocale } from '@automattic/i18n-utils';
import { useSelect, useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { addQueryArgs } from 'calypso/lib/url';
import { useSiteData } from '../hooks/use-site-data';
import { useSiteSlugParam } from '../hooks/use-site-slug-param';
import { USER_STORE, ONBOARD_STORE, SITE_STORE } from '../stores';
import { goToCheckout } from '../utils/checkout';
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { type SiteMigrationIdentifyAction } from './internals/steps-repository/site-migration-identify';
import { AssertConditionState } from './internals/types';
import type { AssertConditionResult, Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect, SiteSelect, UserSelect } from '@automattic/data-stores';

const FLOW_NAME = 'migration-signup';

const migrationSignup: Flow = {
	name: FLOW_NAME,
	isSignupFlow: true,

	useSteps() {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			resetOnboardStore();
		}, [] );

		return [
			STEPS.SITE_MIGRATION_IDENTIFY,
			STEPS.SITE_CREATION_STEP,
			//STEPS.SITE_MIGRATION_IMPORT_OR_MIGRATE,
			STEPS.BUNDLE_TRANSFER,
			STEPS.SITE_MIGRATION_PLUGIN_INSTALL,
			STEPS.PROCESSING,
			STEPS.SITE_MIGRATION_UPGRADE_PLAN,
			//STEPS.VERIFY_EMAIL,
			STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN,
			STEPS.SITE_MIGRATION_INSTRUCTIONS,
			STEPS.ERROR,
		];
	},
	useAssertConditions(): AssertConditionResult {
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
		const aff = queryParams.get( 'aff' );
		const vendorId = queryParams.get( 'vid' );
		const ref = queryParams.get( 'ref' );

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

			if ( ref ) {
				queryParams.set( 'ref', ref );
			}

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				`/setup/${ FLOW_NAME }` +
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
				message: 'migration-signup requires a logged in user',
			};
		}

		return result;
	},

	useSideEffect( currentStep, navigate ) {
		const { siteSlug, siteId } = useSiteData();
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );

		// Ensure we navigate to the site creation step if we have a logged-in user, we don't have the from parameter,
		// we don't have a site defined, and we are not on the site creation, processing, or error steps.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				return;
			}

			if ( ! fromQueryParam ) {
				return;
			}

			if (
				[ STEPS.SITE_CREATION_STEP.slug, STEPS.PROCESSING.slug, STEPS.ERROR.slug ].includes(
					currentStep
				)
			) {
				return;
			}

			if ( ! siteSlug && ! siteId ) {
				navigate( STEPS.SITE_CREATION_STEP.slug );
			}
		}, [ fromQueryParam, siteSlug, siteId, userIsLoggedIn ] );
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
		const siteSlugParam = useSiteSlugParam();
		const urlQueryParams = useQuery();
		const fromQueryParam = urlQueryParams.get( 'from' );

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
					const { from, platform, action } = providedDependencies as {
						from: string;
						platform: string;
						action: SiteMigrationIdentifyAction;
					};

					if ( action === 'skip_platform_identification' || platform !== 'wordpress' ) {
						return exitFlow(
							addQueryArgs(
								{
									siteId,
									siteSlug,
									from,
									origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
									backToFlow: `/${ FLOW_NAME }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
								},
								'/setup/site-setup/importList'
							)
						);
					}

					return navigate(
						addQueryArgs( { from: from, siteSlug, siteId }, STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug )
					);
				}

				case STEPS.SITE_CREATION_STEP.slug: {
					return navigate(
						addQueryArgs(
							{ from: fromQueryParam, siteSlug, siteId },
							STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug
						)
					);
				}

				case STEPS.BUNDLE_TRANSFER.slug: {
					return navigate( STEPS.PROCESSING.slug, { bundleProcessing: true } );
				}

				case STEPS.SITE_MIGRATION_PLUGIN_INSTALL.slug: {
					return navigate( STEPS.PROCESSING.slug );
				}

				case STEPS.PROCESSING.slug: {
					// If we just created the site, go to the upgrade plan step.
					if ( providedDependencies?.siteId && providedDependencies?.siteSlug ) {
						return navigate(
							addQueryArgs( { siteId, siteSlug }, STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug )
						);
					}

					// Any process errors go to the error step.
					if ( providedDependencies?.error ) {
						return navigate( STEPS.ERROR.slug );
					}

					// If the plugin was installed successfully, go to the migration instructions.
					if ( providedDependencies?.pluginInstalled ) {
						return navigate( STEPS.SITE_MIGRATION_INSTRUCTIONS.slug );
					}

					// Otherwise processing has finished from the BundleTransfer step and we need to install the plugin.
					return navigate( STEPS.SITE_MIGRATION_PLUGIN_INSTALL.slug );
				}

				case STEPS.VERIFY_EMAIL.slug: {
					return navigate( STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug );
				}

				case STEPS.SITE_MIGRATION_ASSIGN_TRIAL_PLAN.slug: {
					if ( providedDependencies?.error ) {
						return navigate( STEPS.ERROR.slug );
					}

					return navigate( STEPS.BUNDLE_TRANSFER.slug, {
						siteId,
						siteSlug,
					} );
				}

				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					/*
					if ( providedDependencies?.verifyEmail ) {
						return navigate( STEPS.VERIFY_EMAIL.slug );
					}
					*/

					if ( providedDependencies?.goToCheckout ) {
						const destination = addQueryArgs(
							{
								siteSlug,
								from: fromQueryParam,
							},
							`/setup/${ FLOW_NAME }/${ STEPS.BUNDLE_TRANSFER.slug }`
						);
						goToCheckout( {
							flowName: FLOW_NAME,
							stepName: currentStep,
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
				}

				case STEPS.SITE_MIGRATION_INSTRUCTIONS.slug: {
					return exitFlow( `/home/${ siteSlug }` );
				}
			}
		}

		const goBack = () => {
			switch ( currentStep ) {
				case STEPS.SITE_MIGRATION_UPGRADE_PLAN.slug: {
					return navigate( `${ STEPS.SITE_MIGRATION_IDENTIFY.slug }?${ urlQueryParams }` );
				}
			}
		};

		return { goBack, submit, exitFlow };
	},
};

export default migrationSignup;
