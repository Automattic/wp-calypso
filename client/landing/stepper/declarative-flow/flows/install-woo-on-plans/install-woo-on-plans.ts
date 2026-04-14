import { INSTALL_WOO_ON_PLANS_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { Flow, ProvidedDependencies } from '../../internals/types';

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

		// BUNDLE_TRANSFER reads the software set via useSitePluginSlug(), which reads
		// getBundledPluginSlug(siteSlug) from SITE_STORE. Prime it so the step installs
		// WooCommerce once the atomic transfer completes.
		useEffect( () => {
			if ( siteSlug ) {
				setBundledPluginSlug( siteSlug, WOO_ON_PLANS_SOFTWARE_SET );
			}
		}, [ setBundledPluginSlug, siteSlug ] );

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
					return exitFlow( `https://${ siteSlug }/wp-admin/admin.php?page=wc-admin` );
				}
			}
		}

		return { submit, exitFlow };
	},
};

export default installWooOnPlans;
