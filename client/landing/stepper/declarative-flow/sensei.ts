import { useLocale } from '@automattic/i18n-utils';
import { SENSEI_FLOW, useFlowProgress } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { recordFullStoryEvent } from 'calypso/lib/analytics/fullstory';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { AssertConditionState, Flow } from './internals/types';
import type { StepPath } from './internals/steps-repository';

export const sensei: Flow = {
	name: SENSEI_FLOW,
	title: 'Sensei',
	useSteps() {
		useEffect( () => {
			recordTracksEvent( 'calypso_signup_start', { flow: this.name } );
			recordFullStoryEvent( 'calypso_signup_start_sensei', { flow: this.name } );
		}, [] );

		return [ 'senseiSetup', 'senseiDomain', 'senseiPlan', 'senseiLaunch' ] as StepPath[];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				case 'senseiSetup':
					return navigate( 'senseiDomain' );
				case 'senseiDomain':
					return navigate( 'senseiPlan' );
				default:
					return navigate( 'senseiSetup' );
			}
		};

		const goToStep = ( step: StepPath | `${ StepPath }?${ string }` ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit: goNext };
	},

	useAssertConditions() {
		const flowName = this.name;
		const userIsLoggedIn = useSelect( ( select ) => select( USER_STORE ).isCurrentUserLoggedIn() );
		const locale = useLocale();
		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?redirect_to=/setup/newsletterSetup?flow=${ flowName }`
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
