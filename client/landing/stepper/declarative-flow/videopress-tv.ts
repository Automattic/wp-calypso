import { useFlowProgress, VIDEOPRESS_TV_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { ONBOARD_STORE } from '../stores';
import './internals/videopress.scss';
import type { Flow, ProvidedDependencies } from './internals/types';

const videopressTv: Flow = {
	name: VIDEOPRESS_TV_FLOW,
	get title() {
		return translate( 'VideoPress TV' );
	},
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/intro' ),
			},
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		if ( document.body ) {
			// Make sure we only target videopress tv stepper for body css
			if ( ! document.body.classList.contains( 'is-videopress-tv-stepper' ) ) {
				document.body.classList.add( 'is-videopress-tv-stepper' );
			}
		}

		const name = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName: name } );
		setStepProgress( flowProgress );

		switch ( _currentStep ) {
			case 'intro':
				break;
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'intro':
					return navigate( 'processing' );
			}
			return providedDependencies;
		}

		const goBack = () => {
			return;
		};

		const goNext = () => {
			switch ( _currentStep ) {
				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			return navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default videopressTv;
