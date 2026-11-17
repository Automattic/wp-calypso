import { PLAN_PERSONAL } from '@automattic/calypso-products';
import { Onboard } from '@automattic/data-stores';
import { SEE_IT_FIRST_FLOW, SITE_MIGRATION_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { dashboardLink } from 'calypso/dashboard/utils/link';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import {
	getFullImporterUrl,
	isPlatformImportable,
} from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/import/helper';
import { requestLongScreenshot } from 'calypso/landing/stepper/declarative-flow/internals/steps-repository/see-it-first-preview/screenshot';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { goToUnifiedCheckout } from 'calypso/landing/stepper/utils/checkout';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { addQueryArgs } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { withLocale } from '../../helpers/with-locale';
import { siteSetupImportListPath } from '../site-migration-flow/paths';
import { canUseStaticSiteImport } from '../static-site-import-flow/helpers';
import type {
	FlowV2,
	SubmitHandler,
} from 'calypso/landing/stepper/declarative-flow/internals/types';
import type { ImporterPlatform } from 'calypso/lib/importer/types';

function initialize() {
	return [
		STEPS.SITE_MIGRATION_IDENTIFY,
		...stepsWithRequiredLogin( [ STEPS.SEE_IT_FIRST_PREVIEW, STEPS.STATIC_SITE_IMPORT_READING ] ),
		STEPS.ERROR,
	];
}

const seeItFirst: FlowV2< typeof initialize > = {
	name: SEE_IT_FIRST_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepsProps() {
		const query = useQuery();
		return {
			// A landing page such as /move hands over an address the user already entered.
			[ STEPS.SITE_MIGRATION_IDENTIFY.slug ]: {
				checkOnArrival: query.get( 'start' ) === 'true',
			},
		};
	},
	useSideEffect() {
		const { setIntent, resetOnboardStore } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			resetOnboardStore();
			setIntent( Onboard.SiteIntent.SiteMigration );
		}, [ resetOnboardStore, setIntent ] );
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowPath = this.variantSlug ?? this.name;
		const locale = useFlowLocale();
		const urlQueryParams = useQuery();
		const from = urlQueryParams.get( 'from' ) ?? '';
		const platform = ( urlQueryParams.get( 'platform' ) || 'unknown' ) as ImporterPlatform;
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		// Only checkout's return names a site: the one it just created.
		const { siteId, siteSlug } = useSiteData();

		const exitFlow = ( to: string ) =>
			window.location.replace( addQueryArgs( { ref: SEE_IT_FIRST_FLOW }, to ) );

		const siteMigrationUrl = ( slug: string, args: Record< string, string > ) =>
			addQueryArgs( args, withLocale( `/setup/${ SITE_MIGRATION_FLOW }/${ slug }`, locale ) );

		const stepUrl = ( slug: string, args: Record< string, string > = {} ) =>
			addQueryArgs(
				{ from, platform, ...args },
				withLocale( `/setup/${ flowPath }/${ slug }`, locale )
			);

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.SITE_MIGRATION_IDENTIFY.slug: {
					const source = providedDependencies?.from ?? '';
					const sourcePlatform = providedDependencies?.platform;
					if (
						providedDependencies?.action === 'continue' &&
						providedDependencies.staticSiteImportable &&
						canUseStaticSiteImport( sourcePlatform as ImporterPlatform | undefined, source )
					) {
						// Signing in gives mShots time to capture the long screenshot the preview shows.
						requestLongScreenshot( source );
						return navigate(
							`${ STEPS.SEE_IT_FIRST_PREVIEW.slug }?${ new URLSearchParams( {
								from: source,
								platform: sourcePlatform ?? '',
							} ) }`
						);
					}
					// Only a site we can import gets the preview; anything else moves the usual way.
					return exitFlow(
						siteMigrationUrl( STEPS.SITE_MIGRATION_IDENTIFY.slug, {
							from: source,
							start: source ? 'true' : '',
						} )
					);
				}

				case STEPS.SEE_IT_FIRST_PREVIEW.slug: {
					if ( providedDependencies.action === 'unavailable' ) {
						return navigate( STEPS.SITE_MIGRATION_IDENTIFY.slug );
					}
					// Checkout creates the site; the move starts once it is paid for.
					return goToUnifiedCheckout( {
						flowName: flowPath,
						plan: PLAN_PERSONAL,
						userIsLoggedIn,
						// The pending page resolves the literal placeholder from the purchase receipt.
						destination: `${ stepUrl( STEPS.STATIC_SITE_IMPORT_READING.slug, {
							newSite: '1',
						} ) }&siteId=:siteId`,
						cancelDestination: stepUrl( STEPS.SEE_IT_FIRST_PREVIEW.slug ),
						siteIntent: Onboard.SiteIntent.SiteMigration,
					} );
				}

				case STEPS.STATIC_SITE_IMPORT_READING.slug: {
					switch ( providedDependencies.action ) {
						case 'continue':
							return exitFlow(
								addQueryArgs(
									{ importSessionId: providedDependencies.importSessionId, from, platform },
									dashboardLink( `/sites/${ siteSlug }` )
								)
							);
						// The import server found WordPress behind the source: migrate it into the new site.
						case 'migrate':
							return exitFlow(
								siteMigrationUrl( STEPS.SITE_MIGRATION_CHECK.slug, {
									from,
									platform: 'wordpress',
									siteId: String( siteId ),
									siteSlug,
								} )
							);
						default:
							if ( isPlatformImportable( platform ) && from ) {
								return exitFlow( getFullImporterUrl( platform, siteSlug, from ) );
							}
							return exitFlow(
								siteSetupImportListPath( {
									siteId,
									siteSlug,
									from,
									origin: STEPS.SITE_MIGRATION_IDENTIFY.slug,
									backToFlow: `/${ SITE_MIGRATION_FLOW }/${ STEPS.SITE_MIGRATION_IDENTIFY.slug }`,
								} )
							);
					}
				}
			}
		};

		return { submit };
	},
};

export default seeItFirst;
