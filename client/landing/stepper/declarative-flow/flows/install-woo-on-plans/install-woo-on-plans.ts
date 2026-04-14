import { INSTALL_WOO_ON_PLANS_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { Flow, ProvidedDependencies } from '../../internals/types';
import type { SiteSelect } from '@automattic/data-stores';

const WOO_ON_PLANS_SOFTWARE_SET = 'woo-on-plans';

const INSTALL_WOO_ON_PLANS_STEPS = [ STEPS.BUNDLE_TRANSFER, STEPS.PROCESSING, STEPS.ERROR ];

const installWooOnPlans: Flow = {
	name: INSTALL_WOO_ON_PLANS_FLOW,
	isSignupFlow: false,

	useSteps() {
		return INSTALL_WOO_ON_PLANS_STEPS;
	},
	useStepNavigation( currentStep, navigate ) {
		const { siteId, siteSlug } = useSiteData();
		const { setBundledPluginSlug } = useDispatch( SITE_STORE );
		const dispatch = useReduxDispatch();
		const adminUrl = useSelect(
			( select ) =>
				siteId
					? String(
							( select( SITE_STORE ) as SiteSelect ).getSiteOption( siteId, 'admin_url' ) || ''
					  )
					: '',
			[ siteId ]
		);

		// BUNDLE_TRANSFER reads the software set via useSitePluginSlug() →
		// SITE_STORE.getBundledPluginSlug(siteSlug). Prime it here so the step
		// installs WooCommerce once the atomic transfer completes.
		if ( siteSlug ) {
			setBundledPluginSlug( siteSlug, WOO_ON_PLANS_SOFTWARE_SET );
		}

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'bundleTransfer':
					return navigate( 'processing' );

				case 'processing': {
					const processingResult = providedDependencies.processingResult as ProcessingResult;
					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}
					dispatch( requestAdminMenu( siteId ) );
					return exitFlow(
						adminUrl
							? `${ adminUrl }admin.php?page=wc-admin`
							: `https://${ siteSlug }/wp-admin/admin.php?page=wc-admin`
					);
				}
			}
		}

		return { submit, exitFlow };
	},
};

export default installWooOnPlans;
