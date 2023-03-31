import { useFlowProgress, BUILD_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { Flow, ProvidedDependencies } from './internals/types';

const build: Flow = {
	name: BUILD_FLOW,
	get title() {
		return translate( 'WordPress' );
	},
	useSteps() {
		return [
			{ slug: 'launchpad', component: () => import( './internals/steps-repository/launchpad' ) },
			{
				slug: 'processing',
				component: () => import( './internals/steps-repository/processing-step' ),
			},
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
						return window.location.replace(
							addQueryArgs( `/home/${ providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
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
