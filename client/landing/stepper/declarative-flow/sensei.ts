import { useLocale } from '@automattic/i18n-utils';
import { SENSEI_FLOW, useFlowProgress } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import ProcessingStep from './internals/steps-repository/processing-step';
import SenseiDomain from './internals/steps-repository/sensei-domain';
import SenseiLaunch from './internals/steps-repository/sensei-launch';
import SenseiPlan from './internals/steps-repository/sensei-plan';
import SenseiPurpose from './internals/steps-repository/sensei-purpose';
import SenseiSetup from './internals/steps-repository/sensei-setup';
import { AssertConditionState, Flow } from './internals/types';
import './internals/sensei.scss';

const sensei: Flow = {
	name: SENSEI_FLOW,
	get title() {
		return translate( 'Sensei' );
	},
	useSteps() {
		return [
			{ slug: 'senseiSetup', component: SenseiSetup },
			{ slug: 'senseiDomain', component: SenseiDomain },
			{ slug: 'senseiPlan', component: SenseiPlan },
			{ slug: 'senseiPurpose', component: SenseiPurpose },
			{ slug: 'senseiLaunch', component: SenseiLaunch },
			{ slug: 'processing', component: ProcessingStep },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		const siteSlug = useSiteSlug();
		setStepProgress( flowProgress );

		const submit = ( deps: any, stepResult?: string ) => {
			if ( stepResult ) {
				return navigate( stepResult );
			}
			switch ( _currentStep ) {
				case 'senseiSetup':
					return navigate( 'senseiDomain' );
				case 'senseiDomain':
					return navigate( 'senseiPlan' );
				case 'senseiPurpose':
					return navigate( 'senseiLaunch' );
				case 'senseiLaunch':
				default:
					return window.location.assign( `/home/${ siteSlug }` );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { submit, goToStep };
	},

	useAssertConditions() {
		const flowName = this.name;
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();
		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?redirect_to=/setup/?flow=${ flowName }`
				: `/start/account/user?redirect_to=/setup/?flow=${ flowName }`;
		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );
			return {
				state: AssertConditionState.FAILURE,
			};
		}
		return {
			state: AssertConditionState.SUCCESS,
		};
	},
};

export default sensei;
