/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import DefaultTemplate from '../templates/default';

// mock the QueryPreferences component because it is not needed for this test
jest.mock( '../../../components/data/query-preferences/index.jsx', () => () => {
	return null;
} );

function createState( siteId = 1 ) {
	return {
		currentUser: {
			capabilities: {
				[ siteId ]: {
					publish_posts: true,
				},
			},
		},
		sites: {
			plans: {
				[ siteId ]: {},
			},
		},
		ui: { selectedSiteId: siteId },
		preferences: {
			remoteValues: {},
		},
	};
}

describe( 'DefaultTemplate JITM', () => {
	const mockStore = configureStore();
	const queryClient = new QueryClient();
	const store = mockStore( createState() );
	test( 'onDismiss should be called when the dismiss button is clicked', () => {
		const mockOnDismiss = jest.fn();
		const mockProps = {
			CTA: {
				message: '',
				link: '',
			},
			onDismiss: mockOnDismiss,
			featureClass: 'notice',
			message: '',
		};
		render(
			<Provider store={ store }>
				<QueryClientProvider client={ queryClient }>
					<DefaultTemplate { ...mockProps } />
				</QueryClientProvider>
			</Provider>
		);

		fireEvent.click( screen.getByLabelText( 'Dismiss' ) );

		expect( mockOnDismiss ).toHaveBeenCalledTimes( 1 );
	} );
} );
