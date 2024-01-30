/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { OdieAssistantContext } from '../../../context';
import { mockOdieAssistantProviderProps } from '../../../context/test-utils/context-mock';
import CustomALink from '../custom-a-link';

describe( 'CustomALink', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'renders children correctly', () => {
		render(
			<OdieAssistantContext.Provider value={ mockOdieAssistantProviderProps }>
				<CustomALink href="prompt://test">Test Link</CustomALink>
			</OdieAssistantContext.Provider>
		);

		expect( screen.getByText( 'Test Link' ) ).toBeInTheDocument();
	} );

	it( 'has correct class when inline prop is true', () => {
		render(
			<OdieAssistantContext.Provider value={ mockOdieAssistantProviderProps }>
				<CustomALink href="prompt://test" inline={ true }>
					Test Link
				</CustomALink>
			</OdieAssistantContext.Provider>
		);

		const linkElement = screen.getByText( 'Test Link' );
		expect( linkElement.parentElement ).toHaveClass( 'odie-sources' );
		expect( linkElement.parentElement ).toHaveClass( 'odie-sources-inline' );
	} );

	it( 'does not have inline class when inline prop is false', () => {
		render(
			<OdieAssistantContext.Provider value={ mockOdieAssistantProviderProps }>
				<CustomALink href="prompt://test" inline={ false }>
					Test Link
				</CustomALink>
			</OdieAssistantContext.Provider>
		);

		const linkElement = screen.getByText( 'Test Link' );
		expect( linkElement.parentElement ).toHaveClass( 'odie-sources' );
		expect( linkElement.parentElement ).not.toHaveClass( 'odie-sources-inline' );
	} );
} );
