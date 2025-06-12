/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router';
import { Primitive } from 'utility-types';
import themeReducer from 'calypso/state/themes/reducer';
import { addQueryArgs } from '../../../../../lib/url';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import type { Flow, FlowV2, ProvidedDependencies, StepperStep } from '../../internals/types';

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
export const renderFlow = ( flow: Flow | FlowV2< any > ) => {
	const FakeStepRender = ( { currentStep, dependencies, method } ) => {
		const navigate = useNavigate();
		const location = useLocation();
		const fakeNavigate = ( pathname, state ) => navigate( pathname, { state } );
		const nav = flow.useStepNavigation( currentStep, fakeNavigate );
		const { submit } = nav as any;
		// FlowV2 doesn't have a goBack method.
		const goBack = 'goBack' in nav ? nav.goBack : null;

		const assertionConditionResult = flow.useAssertConditions?.() || {};

		useEffect( () => {
			switch ( method ) {
				case 'submit':
					// FlowV2 has a different signature for the submit handler.
					if ( 'initialize' in flow ) {
						submit?.( { slug: currentStep, providedDependencies: dependencies } );
					} else {
						submit?.( dependencies );
					}
					break;
				case 'goBack':
					goBack?.();
					break;
			}
		}, [] );

		const pathname = location.pathname.replace( `${ flow.name }/`, '' );
		return (
			<>
				<p data-testid="pathname">{ `${ pathname }${ location.search }` }</p>
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

export const runFlowNavigation = (
	flow: FlowV1,
	{ from, dependencies = {}, query = {} },
	direction = 'forward'
) => {
	const { runUseStepNavigationSubmit, runUseStepNavigationGoBack } = renderFlow( flow );

	if ( direction === 'forward' ) {
		runUseStepNavigationSubmit( {
			currentStep: from.slug,
			dependencies: dependencies,
			currentURL: addQueryArgs( query, `/${ flow.name }/${ from.slug }` ),
		} );
	}

	if ( direction === 'back' ) {
		runUseStepNavigationGoBack( {
			currentStep: from.slug,
			dependencies: dependencies,
			currentURL: addQueryArgs( query, `/${ flow.name }/${ from.slug }` ),
		} );
	}

	const destination = getFlowLocation();
	const [ pathname, searchParams ] = destination?.path?.split( '?' ) ?? [ '', '' ];

	return {
		step: pathname.replace( /^\/+/, '' ),
		query: new URLSearchParams( searchParams ),
	};
};

interface MatchDestinationParams {
	step: StepperStep;
	query: URLSearchParams | Record< string, Primitive > | null;
}
interface MatchExternalFlowParams {
	path: string;
	query: URLSearchParams | Record< string, Primitive > | null;
}
declare global {
	// eslint-disable-next-line @typescript-eslint/no-namespace
	namespace jest {
		interface Matchers {
			toMatchDestination( expected: MatchDestinationParams ): CustomMatcherResult;
		}
	}
}

const differenceWith = ( a: URLSearchParams, b: URLSearchParams ) => {
	const aEntries = Array.from( a.entries() );
	return aEntries.filter( ( [ key ] ) => ! b.has( key ) || b.get( key ) !== a.get( key ) );
};

const toObject = ( a: URLSearchParams | Record< string, Primitive > ) => {
	if ( a instanceof URLSearchParams ) {
		const obj = Object.fromEntries( a.entries() );
		if ( Object.keys( obj ).length === 0 ) {
			return null;
		}
		return obj;
	}
	return a;
};

expect.extend( {
	toMatchURL(
		destination: jest.Spied< typeof window.location.assign >,
		expected: MatchExternalFlowParams
	) {
		const results = destination.mock.calls.map( ( [ destination ] ) => {
			const [ flow, queryString ] = destination.toString().split( '?' );
			const expectedFlow = expected.path;

			if ( expected.query instanceof URLSearchParams === false ) {
				expected.query = new URLSearchParams( expected.query as Record< string, string > );
			}
			const receivedQuery = new URLSearchParams( queryString );
			const diff = differenceWith( expected.query, receivedQuery );

			const isSameFlow = flow === expectedFlow;
			const isSameQuery = diff.length === 0;

			if ( ! isSameQuery || ! isSameFlow ) {
				return {
					received: {
						path: flow,
						query: toObject( receivedQuery ),
					},
					pass: false,
				};
			}

			return {
				message: () => `expected ${ destination } to match ${ expected }`,
				pass: true,
			};
		} );

		const okResult = results.find( ( result ) => result.pass === true );

		if ( results.length === 0 ) {
			return {
				message: () => 'number of results of is 0',
				pass: false,
			};
		}

		if ( ! okResult ) {
			return {
				message: () =>
					`Expected: \n\tpath: ${ this.utils.printExpected(
						expected.path
					) }\n\tquery: ${ this.utils.printExpected( toObject( expected.query ) ) }
					\nReceived: ${ results.map(
						( result, index ) =>
							`\n[${ index }]\tpath: ${ this.utils.printReceived(
								result.received?.path
							) } \n\tquery: ${ this.utils.printReceived( result.received?.query ) }`
					) }`,

				pass: false,
			};
		}

		return okResult;
	},
	toMatchDestination( destination, expected: MatchDestinationParams ) {
		const isSameStep = destination.step === expected.step.slug;

		if ( ! isSameStep ) {
			return {
				message: () =>
					`Expected step: ${ this.utils.printExpected(
						decodeURIComponent( expected.step.slug )
					) } \nReceived step: ${ this.utils.printReceived(
						decodeURIComponent( destination.step )
					) }`,
				pass: false,
			};
		}

		if ( expected.query instanceof URLSearchParams === false && expected.query !== null ) {
			expected.query = new URLSearchParams( expected.query as Record< string, string > );
		}

		const diff = expected.query ? differenceWith( expected.query, destination.query ) : [];
		const isSameQuery = expected.query ? diff.length === 0 : true;
		const pass = isSameStep && isSameQuery;

		if ( pass ) {
			return {
				message: () => `expected ${ destination } not to match ${ expected }`,
				pass: true,
			};
		}

		if ( ! isSameQuery ) {
			return {
				message: () =>
					`Expected query: ${ this.utils.printExpected(
						toObject( expected.query )
					) } \nReceived query: ${ this.utils.printReceived( toObject( destination.query ) ) }`,
				pass: false,
			};
		}

		return {
			message: () => `expected ${ destination } to match ${ expected }`,
			pass: false,
		};
	},
} );
