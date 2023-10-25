import { Onboard } from '@automattic/data-stores';
import { DEFAULT_ASSEMBLER_DESIGN } from '@automattic/design-picker';
import { useFlowProgress, AI_ASSEMBLER_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { getTheme } from 'calypso/state/themes/selectors';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import { Flow, ProvidedDependencies } from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';

const SiteIntent = Onboard.SiteIntent;

const withAIAssemblerFlow: Flow = {
	name: AI_ASSEMBLER_FLOW,
	useSideEffect() {
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const { setSelectedDesign, setIntent } = useDispatch( ONBOARD_STORE );
		const selectedTheme = DEFAULT_ASSEMBLER_DESIGN.slug;
		const theme = useSelector( ( state ) => getTheme( state, 'wpcom', selectedTheme ) );

		// We have to query theme for the Jetpack site.
		useQueryTheme( 'wpcom', selectedTheme );

		useEffect( () => {
			if ( ! theme ) {
				// eslint-disable-next-line no-console
				console.log( `The ${ selectedTheme } theme is loading...` );
				return;
			}

			setSelectedDesign( {
				...selectedDesign,
				slug: theme.id,
				title: theme.name,
				recipe: {
					...selectedDesign?.recipe,
					stylesheet: theme.stylesheet,
				},
				design_type: 'assembler',
			} );

			setIntent( SiteIntent.WithThemeAssembler );
		}, [ theme ] );
	},

	useSteps() {
		return [
			STEPS.SITE_PROMPT,
			STEPS.PATTERN_ASSEMBLER,
			STEPS.PROCESSING,
			STEPS.ERROR,
			STEPS.CELEBRATION,
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const intent = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getIntent(),
			[]
		);
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

		const submit = ( providedDependencies: ProvidedDependencies = {}, ...results: string[] ) => {
			recordSubmitStep( providedDependencies, intent, flowName, _currentStep );

			switch ( _currentStep ) {
				case 'processing': {
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					const params = new URLSearchParams( {
						canvas: 'edit',
						assembler: '1',
					} );

					// We will navigate to the celebration step in the follow-up PR
					return exitFlow( `/site-editor/${ siteSlug }?${ params }` );
				}

				case 'patternAssembler': {
					return navigate( 'processing' );
				}

				case 'site-prompt': {
					return navigate( 'patternAssembler' );
				}

				case 'celebration-step': {
					return window.location.assign( providedDependencies.destinationUrl as string );
				}
			}
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'patternAssembler': {
					return window.location.assign( `/themes/${ siteSlug }` );
				}
			}
		};

		return { submit, goBack };
	},
};

export default withAIAssemblerFlow;
