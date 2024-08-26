import { TRANSFERRING_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useDispatch as useReduxDispatch } from 'react-redux';
import { requestAdminMenu } from 'calypso/state/admin-menu/actions';
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
		const dispatch = useReduxDispatch();

		const exitFlow = ( to: string ) => {
			window.location.assign( to );
		};

		function submit( providedDependencies: ProvidedDependencies = {}, ...params: string[] ) {
			switch ( currentStep ) {
				case 'processing': {
					const processingResult = params[ 0 ] as ProcessingResult;

					if ( processingResult === ProcessingResult.FAILURE ) {
						return navigate( 'error' );
					}

					dispatch( requestAdminMenu( siteId ) );

					const redirectTo = providedDependencies?.redirectTo
						? providedDependencies?.redirectTo
						: `/home/${ siteId }`;
					return exitFlow( redirectTo as string );
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
