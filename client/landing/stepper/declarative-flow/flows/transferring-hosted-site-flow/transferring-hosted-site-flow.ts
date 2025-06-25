import { TRANSFERRING_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { useIsValidWooPartner } from 'calypso/landing/stepper/hooks/use-is-valid-woo-partner';
import { useSiteData } from 'calypso/landing/stepper/hooks/use-site-data';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { useSelector } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { isAdminInterfaceWPAdmin } from 'calypso/state/sites/selectors';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { Flow, ProvidedDependencies } from '../../internals/types';

const TRANSFERRING_HOSTED_SITE_STEPS = [
	STEPS.WAIT_FOR_ATOMIC,
	STEPS.WAIT_FOR_PLUGIN_INSTALL,
	STEPS.PROCESSING,
	STEPS.ERROR,
];

const transferringHostedSite: Flow = {
	name: TRANSFERRING_HOSTED_SITE_FLOW,
	isSignupFlow: false,

	useSteps() {
		return TRANSFERRING_HOSTED_SITE_STEPS;
	},
	useStepNavigation( currentStep, navigate ) {
		const { site, siteId, siteSlug } = useSiteData();
		const { setPluginsToVerify } = useDispatch( ONBOARD_STORE );
		const adminInterfaceIsWPAdmin = useSelector( ( state ) =>
			isAdminInterfaceWPAdmin( state, siteId )
		);
		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};
		const dispatch = useReduxDispatch();

		const getRedirectTo = ( providedDependencies: ProvidedDependencies ) => {
			if ( providedDependencies?.redirectTo ) {
				return providedDependencies.redirectTo as string;
			}

			if ( adminInterfaceIsWPAdmin ) {
				return site?.options?.admin_url as string;
			}

			return `/home/${ siteId }`;
		};

		const includeWooCommerce = useIsValidWooPartner();
		if ( includeWooCommerce ) {
			setPluginsToVerify( [ 'woocommerce' ] );
		}

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'processing': {
					const processingResult = providedDependencies.processingResult as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					dispatch( requestAdminMenu( siteId ) );

					return exitFlow( getRedirectTo( providedDependencies ) );
				}

				case 'waitForAtomic': {
					if ( includeWooCommerce ) {
						return navigate( 'waitForPluginInstall', { siteId, siteSlug } );
					}
					return navigate( 'processing' );
				}
				case 'waitForPluginInstall': {
					return navigate( 'processing' );
				}
			}
		}

		return { submit, exitFlow };
	},
};

export default transferringHostedSite;
