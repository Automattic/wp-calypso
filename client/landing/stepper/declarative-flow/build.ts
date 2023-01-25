import { useFlowProgress, BUILD_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import LaunchPad from './internals/steps-repository/launchpad';
import Processing from './internals/steps-repository/processing-step';
import { Flow, ProvidedDependencies } from './internals/types';

const build: Flow = {
	name: BUILD_FLOW,
	get title() {
		return translate( 'WordPress' );
	},
	useSteps() {
		return [
			{ slug: 'launchpad', component: LaunchPad },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const siteSlug = useSiteSlug();
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStep,
			}
		);

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace( `/home/${ providedDependencies?.siteSlug }` );
					}

					return navigate( `launchpad` );
				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'launchpad':
					return window.location.assign( `/view/${ siteSlug }` );
				default:
					return navigate( 'freeSetup' );
			}
		};

		return { goNext, submit };
	},
};

export default build;
