import { SiteSelect } from '@automattic/data-stores';
import { SITE_STORE } from '@automattic/launchpad/src/launchpad';
import { TRANSFERRING_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { useSelector } from 'calypso/state';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
import { isAdminInterfaceWPAdmin } from 'calypso/state/sites/selectors';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { ONBOARD_STORE } from '../stores';
import ErrorStep from './internals/steps-repository/error-step';
import ProcessingStep from './internals/steps-repository/processing-step';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import WaitForAtomic from './internals/steps-repository/wait-for-atomic';
import type { Flow, ProvidedDependencies } from './internals/types';

const transferringHostedSite: Flow = {
	name: TRANSFERRING_HOSTED_SITE_FLOW,
	isSignupFlow: false,

	useSteps() {
		return [
			{ slug: 'waitForAtomic', component: WaitForAtomic },
			{ slug: 'processing', component: ProcessingStep },
			{ slug: 'error', component: ErrorStep },
		];
	},
	useSideEffect() {
		const { setProgress } = useDispatch( ONBOARD_STORE );
		setProgress( 0 );
	},
	useStepNavigation( currentStep, navigate ) {
		const siteId = useSiteIdParam();
		const site = useSelect(
			( select ) => ( siteId && ( select( SITE_STORE ) as SiteSelect ).getSite( siteId ) ) || null,
			[ siteId ]
		);
		const adminInterfaceIsWPAdmin = useSelector( ( state ) =>
			isAdminInterfaceWPAdmin( state, parseInt( siteId! ) )
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

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			switch ( currentStep ) {
				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					dispatch( requestAdminMenu( siteId ) );

					return exitFlow( getRedirectTo( providedDependencies ) );
				}

				case 'waitForAtomic': {
					return navigate( 'processing' );
				}
			}
		}

		return { submit, exitFlow };
	},
};

export default transferringHostedSite;
