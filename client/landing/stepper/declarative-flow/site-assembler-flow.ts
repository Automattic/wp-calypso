import { useFlowProgress, ASSEMBLER_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { useEffect } from 'react';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import PatternAssembler, {
	BLANK_CANVAS_DESIGN,
} from './internals/steps-repository/pattern-assembler';
import Processing from './internals/steps-repository/processing-step';
import { Flow, ProvidedDependencies } from './internals/types';
import type { Design } from '@automattic/design-picker/src/types';

const siteAssemblerFlow: Flow = {
	name: ASSEMBLER_FLOW,
	useSteps() {
		const { setSelectedDesign } = useDispatch( ONBOARD_STORE );
		const selectedTheme = useQuery().get( 'theme' );

		useEffect( () => {
			if ( selectedTheme === 'blank-canvas-3' && this.name === ASSEMBLER_FLOW ) {
				// User has selected blank-canvas-3 theme from theme showcase and enter assembler flow
				setSelectedDesign( BLANK_CANVAS_DESIGN as Design );
			}
		}, [] );

		return [
			{ slug: 'patternAssembler', component: PatternAssembler },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setStepProgress, setPendingAction } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );
		const siteSlug = useSiteSlug();

		const exitFlow = ( to: string ) => {
			setPendingAction( () => {
				return new Promise( () => {
					window.location.assign( to );
				} );
			} );

			return navigate( 'processing' );
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'processing':
					return exitFlow( `/site-editor/${ siteSlug }` );

				case 'patternAssembler': {
					return navigate( 'processing' );
				}
			}
		};

		return { submit };
	},
};

export default siteAssemblerFlow;
