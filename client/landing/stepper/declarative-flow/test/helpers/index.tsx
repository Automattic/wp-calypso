/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router';
import { Primitive } from 'utility-types';
import themeReducer from 'calypso/state/themes/reducer';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import type { Flow, ProvidedDependencies, StepperStep } from '../../internals/types';

export const getFlowLocation = () => {
	return {
		path: screen.getByTestId( 'pathname' ).textContent,
		state: JSON.parse( screen.getByTestId( 'state' ).textContent || '{}' ),
	};
};

export const getAssertionConditionResult = () => {
	return JSON.parse( screen.getByTestId( 'assertionConditionResult' ).textContent || '{}' );
};

interface RenderFlowParams {
	currentStep: string;
	dependencies?: ProvidedDependencies;
	currentURL?: string;
	method: 'submit' | 'goBack' | null;
	cancelDestination?: string;
}
/** Utility to render a flow for testing purposes */
export const renderFlow = ( flow: Flow ) => {
	const FakeStepRender = ( { currentStep, dependencies, method } ) => {
		const navigate = useNavigate();
		const location = useLocation();
		const fakeNavigate = ( pathname, state ) => navigate( pathname, { state } );
		const { submit, goBack } = flow.useStepNavigation( currentStep, fakeNavigate );
		const assertionConditionResult = flow.useAssertConditions?.() || {};

		useEffect( () => {
			switch ( method ) {
				case 'submit':
					submit?.( dependencies );
					break;
				case 'goBack':
					goBack?.();
					break;
			}
		}, [] );

		return (
			<>
				<p data-testid="pathname">{ `${ location.pathname }${ location.search }` }</p>
				<p data-testid="search">{ location.search }</p>
				<p data-testid="state">{ JSON.stringify( location.state ) }</p>
				{ assertionConditionResult && (
					<p data-testid="assertionConditionResult">
						{ JSON.stringify( assertionConditionResult ) }
					</p>
				) }
			</>
		);
	};

	// The Flow>useStepNavigation>submit function needs to be called from inside a component
	const runUseStepNavigation = ( {
		currentURL = '/some-path?siteSlug=example.wordpress.com',
		currentStep,
		dependencies,
		method,
	}: RenderFlowParams ) => {
		renderWithProvider(
			<MemoryRouter initialEntries={ [ currentURL ] }>
				<FakeStepRender
					currentStep={ currentStep }
					dependencies={ dependencies }
					method={ method }
				/>
			</MemoryRouter>,
			{
				initialState: { themes: { queries: [] }, currentUser: { id: 'some-id' } },
				reducers: {
					themes: themeReducer,
				},
			}
		);
	};

	const runUseStepNavigationSubmit = ( params: Omit< RenderFlowParams, 'method' > ) =>
		runUseStepNavigation( { ...params, method: 'submit' } );

	const runUseStepNavigationGoBack = ( params: Omit< RenderFlowParams, 'method' > ) =>
		runUseStepNavigation( { ...params, method: 'goBack' } );

	const runUseAssertionCondition = ( params: Omit< RenderFlowParams, 'method' > ) => {
		runUseStepNavigation( { ...params, method: null } );
		return getAssertionConditionResult();
	};

	return {
		runUseStepNavigationSubmit,
		runUseStepNavigationGoBack,
		runUseAssertionCondition,
	};
};

interface MatchDestinationParams {
	step: StepperStep;
	query: URLSearchParams | Record< string, Primitive >;
}
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace jest {
		interface Matchers {
			toMatchDestination( expected: MatchDestinationParams ): CustomMatcherResult;
		}
	}
}

expect.extend( {
	toMatchDestination: ( destination, expected: MatchDestinationParams ) => {
		const isSameStep = destination.step === expected.step.slug;

		if ( expected.query instanceof URLSearchParams === false ) {
			expected.query = new URLSearchParams( expected.query as Record< string, string > );
		}
		const isSameQuery = expected.query
			? destination.query.toString() === expected.query.toString()
			: true;

		const pass = isSameStep && isSameQuery;

		if ( pass ) {
			return {
				message: () => `expected ${ destination } not to match ${ expected }`,
				pass: true,
			};
		}
		if ( ! isSameStep ) {
			return {
				message: () =>
					`expected ${ destination.step } to match ${ expected.step.slug } but the step is different`,
				pass: false,
			};
		}

		if ( ! isSameQuery ) {
			return {
				message: () =>
					`expected ${ destination.query } to match ${ expected.query } but the query is different`,
				pass: false,
			};
		}

		return {
			message: () => `expected ${ destination } to match ${ expected }`,
			pass: false,
		};
	},
} );
