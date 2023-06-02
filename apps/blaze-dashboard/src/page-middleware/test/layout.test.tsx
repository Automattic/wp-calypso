import { QueryClient } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import React from 'react';
import configureStore from 'redux-mock-store';
import { ProviderWrappedLayout } from '../layout';

const mockStore = configureStore();

describe( 'layout', () => {
	const defaultProps = {
		store: mockStore( {} ),
		queryClient: new QueryClient(),
		currentRoute: '/advertising/example.com',
		currentQuery: {},
		primary: <div data-testid="primary-element" />,
		secondary: undefined,
		redirectUri: '',
	};

	test( 'Remnder a dummy page', async () => {
		render( <ProviderWrappedLayout { ...defaultProps } /> );
		// render( <TestComponent { ...defaultProps }>Test!</TestComponent> );
		// render( <div>Test!</div> );
		expect( screen.getByTestId( 'primary-element' ) ).toBeInTheDocument();
	} );
} );
