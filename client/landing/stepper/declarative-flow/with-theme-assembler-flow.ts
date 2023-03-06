import { Onboard } from '@automattic/data-stores';
import { BLANK_CANVAS_DESIGN } from '@automattic/design-picker';
import { useFlowProgress, WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import PatternAssembler from './internals/steps-repository/pattern-assembler/lazy';
import Processing from './internals/steps-repository/processing-step';
import { Flow, ProvidedDependencies } from './internals/types';
import type { Design } from '@automattic/design-picker/src/types';

const SiteIntent = Onboard.SiteIntent;

const withThemeAssemblerFlow: Flow = {
	name: WITH_THEME_ASSEMBLER_FLOW,
	useSideEffect() {
		const { setSelectedDesign, setIntent } = useDispatch( ONBOARD_STORE );
		const selectedTheme = useQuery().get( 'theme' );

		useEffect( () => {
			if ( selectedTheme === BLANK_CANVAS_DESIGN.slug ) {
				// User has selected blank-canvas-3 theme from theme showcase and enter assembler flow
				setSelectedDesign( BLANK_CANVAS_DESIGN as Design );
			}

			setIntent( SiteIntent.WithThemeAssembler );
		}, [] );
	},

	useSteps() {
		return [
			{ slug: 'patternAssembler', component: PatternAssembler },
			{ slug: 'processing', component: Processing },
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect( ( select ) => select( ONBOARD_STORE ).getIntent() );
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
			recordSubmitStep( providedDependencies, intent, flowName, _currentStep );

			switch ( _currentStep ) {
				case 'processing':
					window.sessionStorage.setItem( 'wpcom_signup_completed_flow', 'pattern_assembler' );
					return exitFlow( `/site-editor/${ siteSlug }` );

				case 'patternAssembler': {
					return navigate( 'processing' );
				}
			}
		};

		return { submit };
	},
};

export default withThemeAssemblerFlow;
