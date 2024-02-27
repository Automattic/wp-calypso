/**
 * @jest-environment jsdom
 */
import { screen } from '@testing-library/react';
import React, { useEffect } from 'react';
import { MemoryRouter, useNavigate, useLocation } from 'react-router';
import { renderWithProvider } from '../../../../../test-helpers/testing-library';
import type { Flow } from '../../internals/types';

export const getFlowLocation = () => {
	return {
		path: screen.getByTestId( 'pathname' ).textContent,
		state: JSON.parse( screen.getByTestId( 'state' ).textContent || '{}' ),
	};
};

/** Utility to render a flow for testing purposes */
export const renderFlow = ( flow: Flow ) => {
	const FakeStepRender = ( { currentStep, dependencies } ) => {
		const navigate = useNavigate();
		const location = useLocation();
		const fakeNavigate = ( pathname, state ) => navigate( pathname, { state } );
		const { submit } = flow.useStepNavigation( currentStep, fakeNavigate );

		useEffect( () => {
			if ( submit ) {
				submit( dependencies );
			}
		}, [] );

		return (
			<>
				<p data-testid="pathname">{ `${ location.pathname }${ location.search }` }</p>
				<p data-testid="search">{ location.search }</p>
				<p data-testid="state">{ JSON.stringify( location.state ) }</p>
			</>
		);
	};

	// The Flow>useStepNavigation>submit function needs to be called from inside a component
	const runUseStepNavigationSubmit = ( { currentStep, dependencies } ) => {
		renderWithProvider(
			<MemoryRouter initialEntries={ [ '/some-path?siteSlug=example.wordpress.com' ] }>
				<FakeStepRender currentStep={ currentStep } dependencies={ dependencies } />
			</MemoryRouter>
		);
	};

	return {
		runUseStepNavigationSubmit,
	};
};
