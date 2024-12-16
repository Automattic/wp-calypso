import { Onboard } from '@automattic/data-stores';
import { getAssemblerDesign } from '@automattic/design-picker';
import { WITH_THEME_ASSEMBLER_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useQueryTheme } from 'calypso/components/data/query-theme';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { activateOrInstallThenActivate } from 'calypso/state/themes/actions';
import { getTheme } from 'calypso/state/themes/selectors';
import { useSiteData } from '../hooks/use-site-data';
import { ONBOARD_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';
import type { OnboardSelect } from '@automattic/data-stores';
import type { CalypsoDispatch } from 'calypso/state/types';
import type { AnyAction } from 'redux';
import type { ThunkAction } from 'redux-thunk';

const SiteIntent = Onboard.SiteIntent;

const withThemeAssemblerFlow: Flow = {
	name: WITH_THEME_ASSEMBLER_FLOW,
	isSignupFlow: false,
	useSideEffect() {
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const { setSelectedDesign, setIntent } = useDispatch( ONBOARD_STORE );
		const selectedTheme = getAssemblerDesign().slug;
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
		return [ STEPS.PROCESSING, STEPS.ERROR ];
	},

	useStepNavigation( _currentStep, navigate ) {
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const reduxDispatch = useReduxDispatch();
		const selectedTheme = getAssemblerDesign().slug;
		const { siteSlug, siteId } = useSiteData();

		const handleSelectSite = () => {
			setPendingAction( enableAssemblerTheme( selectedTheme, siteId, siteSlug, reduxDispatch ) );

			navigate( 'processing' );
		};

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const submit = ( providedDependencies: ProvidedDependencies = {}, ...results: string[] ) => {
			switch ( _currentStep ) {
				case 'processing': {
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					return handleSelectSite();
				}
			}
		};

		return { submit };
	},

	useAssertConditions(): AssertConditionResult {
		const { site, siteSlug } = useSiteData();
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! siteSlug ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'site-setup did not provide the site slug it is configured to.',
			};
		}

		if ( ! site ) {
			result = {
				state: AssertConditionState.CHECKING,
			};
		}

		return result;
	},
};

function enableAssemblerTheme(
	themeId: string,
	siteId: number,
	siteSlug: string,
	reduxDispatch: CalypsoDispatch
) {
	const params = new URLSearchParams( {
		canvas: 'edit',
		assembler: '1',
	} );

	return () =>
		Promise.resolve()
			.then( () =>
				reduxDispatch(
					activateOrInstallThenActivate( themeId, siteId, { source: 'assembler' } ) as ThunkAction<
						PromiseLike< string >,
						any,
						any,
						AnyAction
					>
				)
			)
			.then( () => window.location.assign( `/site-editor/${ siteSlug }?${ params }` ) );
}

export default withThemeAssemblerFlow;
