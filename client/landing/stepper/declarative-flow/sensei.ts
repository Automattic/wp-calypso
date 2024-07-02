import { SENSEI_FLOW } from '@automattic/onboarding';
import { translate } from 'i18n-calypso';
import { useSelector } from 'react-redux';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { useSiteSlug } from '../hooks/use-site-slug';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import Intro from './internals/steps-repository/intro';
import ProcessingStep from './internals/steps-repository/processing-step';
import SenseiDomain from './internals/steps-repository/sensei-domain';
import SenseiLaunch from './internals/steps-repository/sensei-launch';
import SenseiPlan from './internals/steps-repository/sensei-plan';
import SenseiPurpose from './internals/steps-repository/sensei-purpose';
import SenseiSetup from './internals/steps-repository/sensei-setup';
import { Flow } from './internals/types';
import './internals/sensei.scss';

const sensei: Flow = {
	name: SENSEI_FLOW,
	get title() {
		return translate( 'Course Creator' );
	},
	isSignupFlow: true,
	useSteps() {
		const publicSteps = [
			{ slug: 'intro', component: Intro },
			{ slug: 'senseiSetup', component: SenseiSetup },
			{ slug: 'senseiDomain', component: SenseiDomain },
		];

		const privateSteps = stepsWithRequiredLogin( [
			{ slug: 'senseiPlan', component: SenseiPlan },
			{ slug: 'senseiPurpose', component: SenseiPurpose },
			{ slug: 'senseiLaunch', component: SenseiLaunch },
			{ slug: 'processing', component: ProcessingStep },
		] );

		return [ ...publicSteps, ...privateSteps ];
	},

	useStepNavigation( _currentStep, navigate ) {
		const siteSlug = useSiteSlug();
		const isLoggedIn = useSelector( isUserLoggedIn );

		const submit = ( deps: any, stepResult?: string ) => {
			if ( stepResult ) {
				return navigate( stepResult );
			}

			switch ( _currentStep ) {
				case 'intro':
					return navigate( 'senseiSetup' );
				case 'senseiSetup':
					if ( isLoggedIn ) {
						return navigate( 'senseiDomain' );
					}
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
};

export default sensei;
